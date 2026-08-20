from rest_framework import serializers
from .models import Project
from apps.users.serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class ProjectSerializer(serializers.ModelSerializer):
    created_by_detail = UserSerializer(source='created_by', read_only=True)
    members_detail = UserSerializer(source='members', many=True, read_only=True)
    member_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        source='members',
        write_only=True,
        required=False
    )
    total_tasks = serializers.SerializerMethodField()
    completed_tasks = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'status', 'created_by', 'created_by_detail',
            'members', 'members_detail', 'member_ids', 'start_date', 'end_date',
            'created_at', 'updated_at', 'total_tasks', 'completed_tasks', 'progress_percentage'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_total_tasks(self, obj):
        return obj.tasks.count()

    def get_completed_tasks(self, obj):
        return obj.tasks.filter(status='COMPLETED').count()

    def get_progress_percentage(self, obj):
        total = obj.tasks.count()
        if total == 0:
            return 0
        completed = obj.tasks.filter(status='COMPLETED').count()
        return round((completed / total) * 100)
