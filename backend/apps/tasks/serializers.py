from rest_framework import serializers
from .models import Task, DeadlineHistory, TaskComment, TaskActivity, TaskAttachment
from apps.users.serializers import UserSerializer
from apps.projects.models import Project

class DeadlineHistorySerializer(serializers.ModelSerializer):
    changed_by_detail = UserSerializer(source='changed_by', read_only=True)

    class Meta:
        model = DeadlineHistory
        fields = ['id', 'task', 'previous_deadline', 'new_deadline', 'changed_by', 'changed_by_detail', 'changed_at', 'reason']
        read_only_fields = ['id', 'changed_at']


class TaskCommentSerializer(serializers.ModelSerializer):
    author_detail = UserSerializer(source='author', read_only=True)

    class Meta:
        model = TaskComment
        fields = ['id', 'task', 'author', 'author_detail', 'content', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']


class TaskActivitySerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)

    class Meta:
        model = TaskActivity
        fields = ['id', 'task', 'user', 'user_detail', 'activity_type', 'description', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class TaskAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_detail = UserSerializer(source='uploaded_by', read_only=True)

    class Meta:
        model = TaskAttachment
        fields = ['id', 'task', 'uploaded_by', 'uploaded_by_detail', 'file', 'file_name', 'file_size', 'created_at']
        read_only_fields = ['id', 'uploaded_by', 'file_name', 'file_size', 'created_at']


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_detail = UserSerializer(source='assigned_to', read_only=True)
    created_by_detail = UserSerializer(source='created_by', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    deadline_history_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    activity_count = serializers.SerializerMethodField()
    attachments_count = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'project', 'project_name',
            'assigned_to', 'assigned_to_detail', 'priority', 'status',
            'deadline', 'created_by', 'created_by_detail',
            'created_at', 'updated_at', 'deadline_history_count', 'comments_count',
            'activity_count', 'attachments_count'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_deadline_history_count(self, obj):
        return obj.deadline_history.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_activity_count(self, obj):
        return obj.activity_history.count()

    def get_attachments_count(self, obj):
        return obj.attachments.count()
