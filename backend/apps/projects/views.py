from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
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
