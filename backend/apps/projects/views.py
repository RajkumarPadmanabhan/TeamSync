from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.mail import send_mail
from .models import Project
from .serializers import ProjectSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.is_admin_role()

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Project.objects.none()
        
        if user.is_admin_role():
            return Project.objects.all().order_by('-created_at')
            
        # STRICT ENFORCEMENT: Team Members can ONLY view projects they are assigned to!
        return Project.objects.filter(members=user).distinct().order_by('-created_at')

    def perform_create(self, serializer):
        project = serializer.save(created_by=self.request.user)
        # By default, add creator to members
        project.members.add(self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_member(self, request, pk=None):
        if not request.user.is_admin_role():
            return Response({'detail': 'Only admins can add members to project.'}, status=status.HTTP_403_FORBIDDEN)
        project = self.get_object()
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'detail': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(id=user_id)
            project.members.add(user)
            return Response({'detail': f'{user.get_full_name() or user.username} added to project successfully.', 'project': ProjectSerializer(project).data})
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def remove_member(self, request, pk=None):
        if not request.user.is_admin_role():
            return Response({'detail': 'Only admins can remove members from project.'}, status=status.HTTP_403_FORBIDDEN)
        project = self.get_object()
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'detail': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(id=user_id)
            project.members.remove(user)
            return Response({'detail': f'{user.get_full_name() or user.username} removed from project.', 'project': ProjectSerializer(project).data})
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


from .models import ProjectInvitation
from .serializers import ProjectInvitationSerializer

class ProjectInvitationViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectInvitationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return ProjectInvitation.objects.none()
        if user.is_admin_role():
            return ProjectInvitation.objects.all()
        return ProjectInvitation.objects.filter(invited_user=user)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def send_request(self, request):
        if not request.user.is_admin_role():
            return Response({'detail': 'Only admins can send project invitations.'}, status=status.HTTP_403_FORBIDDEN)
        
        project_id = request.data.get('project_id')
        user_id = request.data.get('user_id')
        message = request.data.get('message', 'Admin has invited you to join the project.')

        if not project_id or not user_id:
            return Response({'detail': 'project_id and user_id are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            project = Project.objects.get(id=project_id)
            user_to_invite = User.objects.get(id=user_id)
        except (Project.DoesNotExist, User.DoesNotExist):
            return Response({'detail': 'Project or User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if project.members.filter(id=user_to_invite.id).exists():
            return Response({'detail': f'{user_to_invite.username} is already a member of this project.'}, status=status.HTTP_400_BAD_REQUEST)

        invitation, created = ProjectInvitation.objects.update_or_create(
            project=project,
            invited_user=user_to_invite,
            defaults={
                'sender': request.user,
                'status': ProjectInvitation.Status.PENDING,
                'message': message
            }
        )

        # EMAIL NOTIFICATION: Notify Team Member that Admin invited them to join a project
        if user_to_invite.email:
            try:
                subject = f"Project Invitation: Admin invited you to join '{project.name}'"
                body = (
                    f"Hello {user_to_invite.first_name or user_to_invite.username},\n\n"
                    f"Admin ({request.user.get_full_name() or request.user.username}) is trying to add you into a new project team: '{project.name}'.\n\n"
                    f"Message from Admin: \"{message}\"\n\n"
                    f"Please log in to TeamSync and check your 'Project Requests' section to approve or accept the request to join the project.\n\n"
                    f"Best regards,\nTeamSync Admin Team"
                )
                send_mail(
                    subject=subject,
                    message=body,
                    from_email='noreply@teamsync.com',
                    recipient_list=[user_to_invite.email],
                    fail_silently=True
                )
            except Exception as e:
                print("Email dispatch error:", e)

        return Response({
            'detail': f'Invitation request sent to {user_to_invite.username} successfully! Email notification dispatched.',
            'invitation': ProjectInvitationSerializer(invitation).data
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def respond(self, request, pk=None):
        invitation = self.get_object()
        user = request.user

        if invitation.invited_user != user and not user.is_admin_role():
            return Response({'detail': 'You cannot respond to an invitation sent to another user.'}, status=status.HTTP_403_FORBIDDEN)

        action_choice = request.data.get('action')
        if action_choice not in ['accept', 'reject']:
            return Response({'detail': "action must be 'accept' or 'reject'."}, status=status.HTTP_400_BAD_REQUEST)

        if action_choice == 'accept':
            invitation.status = ProjectInvitation.Status.ACCEPTED
            invitation.save()
            invitation.project.members.add(invitation.invited_user)
            return Response({
                'detail': f'You have ACCEPTED the invitation to join project "{invitation.project.name}".',
                'invitation': ProjectInvitationSerializer(invitation).data
            })
        else:
            invitation.status = ProjectInvitation.Status.REJECTED
            invitation.save()
            return Response({
                'detail': f'You have REJECTED the invitation to join project "{invitation.project.name}". Admin can re-send another request.',
                'invitation': ProjectInvitationSerializer(invitation).data
            })

