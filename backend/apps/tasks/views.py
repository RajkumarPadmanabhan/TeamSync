from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db import models
from .models import Task, DeadlineHistory, TaskComment
from .serializers import TaskSerializer, DeadlineHistorySerializer, TaskCommentSerializer
from apps.projects.models import Project
from django.contrib.auth import get_user_model

User = get_user_model()

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Task.objects.all().select_related('project', 'assigned_to', 'created_by').order_by('-created_at')
        
        # Filter options
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
        # Admin check for creating task
        if not self.request.user.is_admin_role():
            raise permissions.PermissionDenied("Only admins can create tasks.")
        
        task = serializer.save(created_by=self.request.user)
        
        # If task was created with a deadline, record initial deadline log
        if task.deadline:
            DeadlineHistory.objects.create(
                task=task,
                previous_deadline=None,
                new_deadline=task.deadline,
                changed_by=self.request.user,
                reason="Initial task creation deadline"
            )

    def perform_update(self, serializer):
        user = self.request.user
        instance = self.get_object()
        
        # Check permissions:
        # Team Members can update status & comments.
        # Only Admins can reassign, change priority, or change deadlines.
        new_deadline = serializer.validated_data.get('deadline', instance.deadline)
        old_deadline = instance.deadline

        # If user is team member (not admin), restrict fields if trying to change admin-only fields
        if not user.is_admin_role():
            # Check if attempting to change restricted fields
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

        # Save task update
        updated_task = serializer.save()

        # Additional Challenge: Check if deadline changed and record history
        if old_deadline != new_deadline:
            reason = self.request.data.get('deadline_reason', 'Deadline updated by admin')
            DeadlineHistory.objects.create(
                task=updated_task,
                previous_deadline=old_deadline,
                new_deadline=new_deadline,
                changed_by=user,
                reason=reason
            )

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
            return Response(TaskCommentSerializer(comment).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        user = request.user
        total_projects = Project.objects.count()
        total_tasks = Task.objects.count()
        completed_tasks = Task.objects.filter(status='COMPLETED').count()
        in_progress_tasks = Task.objects.filter(status='IN_PROGRESS').count()
        todo_tasks = Task.objects.filter(status='TODO').count()
        in_review_tasks = Task.objects.filter(status='IN_REVIEW').count()
        total_deadline_changes = DeadlineHistory.objects.count()
        
        my_tasks_count = Task.objects.filter(assigned_to=user).count() if user.is_authenticated else 0
        my_completed_tasks = Task.objects.filter(assigned_to=user, status='COMPLETED').count() if user.is_authenticated else 0

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
