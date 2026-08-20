from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from apps.projects.models import Project
from apps.tasks.models import Task, DeadlineHistory, TaskComment

User = get_user_model()

class TaskModelAndDeadlineHistoryTestCase(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin_test',
            email='admin@test.com',
            password='password123',
            role=User.Role.ADMIN
        )
        self.member = User.objects.create_user(
            username='member_test',
            email='member@test.com',
            password='password123',
            role=User.Role.MEMBER
        )
        self.project = Project.objects.create(
            name='Test Project',
            description='Testing deadline tracking',
            created_by=self.admin
        )
        self.project.members.add(self.admin, self.member)

    def test_create_task(self):
        deadline = timezone.now() + timedelta(days=5)
        task = Task.objects.create(
            title='Test Task',
            description='Test task description',
            project=self.project,
            assigned_to=self.member,
            priority=Task.Priority.HIGH,
            status=Task.Status.TODO,
            deadline=deadline,
            created_by=self.admin
        )
        self.assertEqual(task.title, 'Test Task')
        self.assertEqual(task.assigned_to, self.member)
        self.assertEqual(task.priority, Task.Priority.HIGH)

    def test_deadline_history_creation(self):
        old_deadline = timezone.now() + timedelta(days=5)
        task = Task.objects.create(
            title='Deadline Test Task',
            project=self.project,
            deadline=old_deadline,
            created_by=self.admin
        )

        new_deadline = timezone.now() + timedelta(days=10)
        history = DeadlineHistory.objects.create(
            task=task,
            previous_deadline=old_deadline,
            new_deadline=new_deadline,
            changed_by=self.admin,
            reason='Client extended scope'
        )

        self.assertEqual(history.previous_deadline, old_deadline)
        self.assertEqual(history.new_deadline, new_deadline)
        self.assertEqual(history.changed_by, self.admin)
        self.assertEqual(history.reason, 'Client extended scope')
        self.assertEqual(task.deadline_history.count(), 1)

    def test_task_comment(self):
        task = Task.objects.create(
            title='Comment Test Task',
            project=self.project,
            created_by=self.admin
        )
        comment = TaskComment.objects.create(
            task=task,
            author=self.member,
            content='Finished preliminary testing'
        )
        self.assertEqual(comment.author, self.member)
        self.assertEqual(task.comments.count(), 1)
