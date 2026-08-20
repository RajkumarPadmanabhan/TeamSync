from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from .models import Task, DeadlineHistory, TaskComment, TaskActivity, TaskAttachment
from .serializers import (
    TaskSerializer,
    DeadlineHistorySerializer,
    TaskCommentSerializer,
    TaskActivitySerializer,
    TaskAttachmentSerializer
)
from apps.projects.models import Project
from django.contrib.auth import get_user_model

User = get_user_model()

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Task.objects.all().select_related('project', 'assigned_to', 'created_by').order_by('-created_at')
        
        # STRICT ENFORCEMENT: Team Members can ONLY access tasks assigned to them!
        if not user.is_admin_role():
            queryset = queryset.filter(assigned_to=user)

        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
            
        assigned_to_me = self.request.query_params.get('assigned_to_me')
        if assigned_to_me == 'true':
            queryset = queryset.filter(assigned_to=user)
            
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        priority_filter = self.request.query_params.get('priority')
        if priority_filter:
            queryset = queryset.filter(priority=priority_filter)
            
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_admin_role():
            raise permissions.PermissionDenied("Only admins can create tasks.")
        
        task = serializer.save(created_by=user)
        
        # Auto-add assignee to project members so project appears under assigned user's Active Projects
        if task.assigned_to and not task.project.members.filter(id=task.assigned_to.id).exists():
            task.project.members.add(task.assigned_to)
        
        # Log Activity
        TaskActivity.objects.create(
            task=task,
            user=user,
            activity_type=TaskActivity.ActivityType.CREATED,
            description=f"Created task '{task.title}' assigned to {task.assigned_to or 'Unassigned'}"
        )

        # Initial Deadline Log
        if task.deadline:
            DeadlineHistory.objects.create(
                task=task,
                previous_deadline=None,
                new_deadline=task.deadline,
                changed_by=user,
                reason="Initial task creation deadline"
            )

        # Email Notification for Assignee
        if task.assigned_to and task.assigned_to.email:
            try:
                send_mail(
                    subject=f"[TeamSync] New Task Assigned: {task.title}",
                    message=f"Hello {task.assigned_to.first_name or task.assigned_to.username},\n\nYou have been assigned a new task: '{task.title}' under project '{task.project.name}'.\n\nPriority: {task.priority}\nDeadline: {task.deadline}\n\nLog in to TeamSync to view details.",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[task.assigned_to.email],
                    fail_silently=True
                )
            except Exception as e:
                print("Email notification error:", e)

    def perform_update(self, serializer):
        user = self.request.user
        instance = self.get_object()
        
        old_status = instance.status
        old_deadline = instance.deadline
        old_assignee = instance.assigned_to

        new_deadline = serializer.validated_data.get('deadline', instance.deadline)
        new_status = serializer.validated_data.get('status', instance.status)
        new_assignee = serializer.validated_data.get('assigned_to', instance.assigned_to)

        # Team Member restriction check
        if not user.is_admin_role():
            if 'title' in serializer.validated_data and serializer.validated_data['title'] != instance.title:
                raise permissions.PermissionDenied("Team members cannot change task title.")
            if 'project' in serializer.validated_data and serializer.validated_data['project'] != instance.project:
                raise permissions.PermissionDenied("Team members cannot change task project.")
            if 'assigned_to' in serializer.validated_data and serializer.validated_data['assigned_to'] != instance.assigned_to:
                raise permissions.PermissionDenied("Team members cannot reassign tasks.")
            if 'priority' in serializer.validated_data and serializer.validated_data['priority'] != instance.priority:
                raise permissions.PermissionDenied("Team members cannot change task priority.")
            if new_deadline != old_deadline:
                raise permissions.PermissionDenied("Team members cannot change task deadline.")

        updated_task = serializer.save()

        # Auto-add new assignee to project members so project appears under assigned user's Active Projects
        if updated_task.assigned_to and not updated_task.project.members.filter(id=updated_task.assigned_to.id).exists():
            updated_task.project.members.add(updated_task.assigned_to)

        # Log Activity & Send Email for Status Change
        if old_status != new_status:
            TaskActivity.objects.create(
                task=updated_task,
                user=user,
                activity_type=TaskActivity.ActivityType.STATUS_CHANGED,
                description=f"Updated status from '{old_status}' to '{new_status}'"
            )

        # Log Activity & Send Email for Reassignment
        if old_assignee != new_assignee:
            TaskActivity.objects.create(
                task=updated_task,
                user=user,
                activity_type=TaskActivity.ActivityType.REASSIGNED,
                description=f"Reassigned task from '{old_assignee}' to '{new_assignee}'"
            )
            if new_assignee and new_assignee.email:
                try:
                    send_mail(
                        subject=f"[TeamSync] Task Reassigned: {updated_task.title}",
                        message=f"Hello {new_assignee.first_name or new_assignee.username},\n\nTask '{updated_task.title}' has been reassigned to you by {user.get_full_name() or user.username}.\n\nLog in to TeamSync to view details.",
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[new_assignee.email],
                        fail_silently=True
                    )
                except Exception as e:
                    print("Email notification error:", e)

        # Additional Challenge: Check if deadline changed, create DeadlineHistory, Log Activity & Send Email
        if old_deadline != new_deadline:
            reason = self.request.data.get('deadline_reason', 'Deadline updated by admin')
            DeadlineHistory.objects.create(
                task=updated_task,
                previous_deadline=old_deadline,
                new_deadline=new_deadline,
                changed_by=user,
                reason=reason
            )
            TaskActivity.objects.create(
                task=updated_task,
                user=user,
                activity_type=TaskActivity.ActivityType.DEADLINE_CHANGED,
                description=f"Deadline updated from {old_deadline} to {new_deadline}. Reason: '{reason}'"
            )
            if updated_task.assigned_to and updated_task.assigned_to.email:
                try:
                    send_mail(
                        subject=f"[TeamSync] Task Deadline Revised: {updated_task.title}",
                        message=f"Hello {updated_task.assigned_to.first_name or updated_task.assigned_to.username},\n\nThe deadline for task '{updated_task.title}' was updated to {new_deadline}.\n\nReason: {reason}\n\nLog in to TeamSync for audit details.",
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[updated_task.assigned_to.email],
                        fail_silently=True
                    )
                except Exception as e:
                    print("Email notification error:", e)

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_admin_role():
            return Response({'detail': 'Only admins can delete tasks.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    def deadline_history(self, request, pk=None):
        task = self.get_object()
        history = task.deadline_history.all()
        serializer = DeadlineHistorySerializer(history, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def activity_history(self, request, pk=None):
        task = self.get_object()
        activities = task.activity_history.all()
        serializer = TaskActivitySerializer(activities, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        task = self.get_object()
        if request.method == 'GET':
            comments = task.comments.all()
            serializer = TaskCommentSerializer(comments, many=True)
            return Response(serializer.data)
        elif request.method == 'POST':
            content = request.data.get('content')
            if not content or not content.strip():
                return Response({'detail': 'Comment content cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)
            comment = TaskComment.objects.create(
                task=task,
                author=request.user,
                content=content.strip()
            )
            # Log Activity
            TaskActivity.objects.create(
                task=task,
                user=request.user,
                activity_type=TaskActivity.ActivityType.COMMENT_ADDED,
                description=f"Posted a comment: '{content.strip()[:60]}...'"
            )
            return Response(TaskCommentSerializer(comment).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get', 'post'])
    def attachments(self, request, pk=None):
        task = self.get_object()
        if request.method == 'GET':
            attachments = task.attachments.all()
            serializer = TaskAttachmentSerializer(attachments, many=True)
            return Response(serializer.data)
        elif request.method == 'POST':
            file_obj = request.FILES.get('file')
            if not file_obj:
                return Response({'detail': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)
            attachment = TaskAttachment.objects.create(
                task=task,
                uploaded_by=request.user,
                file=file_obj,
                file_name=file_obj.name,
                file_size=file_obj.size
            )
            # Log Activity
            TaskActivity.objects.create(
                task=task,
                user=request.user,
                activity_type=TaskActivity.ActivityType.FILE_ATTACHED,
                description=f"Uploaded file attachment '{file_obj.name}'"
            )
            return Response(TaskAttachmentSerializer(attachment).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({})
            
        if user.is_admin_role():
            total_projects = Project.objects.count()
            total_tasks = Task.objects.count()
            completed_tasks = Task.objects.filter(status='COMPLETED').count()
            in_progress_tasks = Task.objects.filter(status='IN_PROGRESS').count()
            todo_tasks = Task.objects.filter(status='TODO').count()
            in_review_tasks = Task.objects.filter(status='IN_REVIEW').count()
            total_deadline_changes = DeadlineHistory.objects.filter(previous_deadline__isnull=False).values('task').distinct().count()
        else:
            member_projects = Project.objects.filter(members=user)
            member_tasks = Task.objects.filter(assigned_to=user)
            total_projects = member_projects.count()
            total_tasks = member_tasks.count()
            completed_tasks = member_tasks.filter(status='COMPLETED').count()
            in_progress_tasks = member_tasks.filter(status='IN_PROGRESS').count()
            todo_tasks = member_tasks.filter(status='TODO').count()
            in_review_tasks = member_tasks.filter(status='IN_REVIEW').count()
            total_deadline_changes = DeadlineHistory.objects.filter(task__in=member_tasks, previous_deadline__isnull=False).values('task').distinct().count()

        my_tasks_count = Task.objects.filter(assigned_to=user).count()
        my_completed_tasks = Task.objects.filter(assigned_to=user, status='COMPLETED').count()
        completion_rate = round((completed_tasks / total_tasks * 100)) if total_tasks > 0 else 0

        return Response({
            'total_projects': total_projects,
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'in_progress_tasks': in_progress_tasks,
            'todo_tasks': todo_tasks,
            'in_review_tasks': in_review_tasks,
            'completion_rate': completion_rate,
            'total_deadline_changes': total_deadline_changes,
            'my_tasks_count': my_tasks_count,
            'my_completed_tasks': my_completed_tasks,
        })
