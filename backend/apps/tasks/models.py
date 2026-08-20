from django.db import models
from django.conf import settings
from apps.projects.models import Project

class Task(models.Model):
    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        URGENT = 'URGENT', 'Urgent'

    class Status(models.TextChoices):
        TODO = 'TODO', 'To Do'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        IN_REVIEW = 'IN_REVIEW', 'In Review'
        COMPLETED = 'COMPLETED', 'Completed'

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tasks'
    )
    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.TODO
    )
    deadline = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_tasks'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"[{self.project.name}] {self.title}"


class DeadlineHistory(models.Model):
    """
    Maintains a record of all deadline revisions for a task.
    Required by Additional Challenge.
    """
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='deadline_history'
    )
    previous_deadline = models.DateTimeField(null=True, blank=True)
    new_deadline = models.DateTimeField(null=True, blank=True)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='deadline_changes'
    )
    changed_at = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-changed_at']

    def __str__(self):
        return f"Task {self.task.id} deadline changed from {self.previous_deadline} to {self.new_deadline}"


class TaskComment(models.Model):
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='task_comments'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.author} on {self.task.title}"


class TaskActivity(models.Model):
    """
    Maintains chronological activity history for a task (Optional Enhancement).
    """
    class ActivityType(models.TextChoices):
        CREATED = 'CREATED', 'Created Task'
        STATUS_CHANGED = 'STATUS_CHANGED', 'Status Changed'
        DEADLINE_CHANGED = 'DEADLINE_CHANGED', 'Deadline Changed'
        REASSIGNED = 'REASSIGNED', 'Reassigned Task'
        COMMENT_ADDED = 'COMMENT_ADDED', 'Comment Added'
        FILE_ATTACHED = 'FILE_ATTACHED', 'File Attached'

    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='activity_history'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='task_activities'
    )
    activity_type = models.CharField(
        max_length=30,
        choices=ActivityType.choices,
        default=ActivityType.CREATED
    )
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.activity_type}] {self.description} by {self.user}"


class TaskAttachment(models.Model):
    """
    File attachments for a task (Optional Enhancement).
    """
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='attachments'
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='uploaded_attachments'
    )
    file = models.FileField(upload_to='attachments/')
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Attachment '{self.file_name}' on Task #{self.task.id}"
