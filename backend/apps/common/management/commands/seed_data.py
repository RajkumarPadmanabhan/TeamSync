from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from apps.projects.models import Project
from apps.tasks.models import Task, DeadlineHistory, TaskComment

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds initial demo data for TeamSync MNC Task Management'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting database seeding...'))

        # Create Admin
        admin, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@teamsync.com',
                'first_name': 'Rajkumar',
                'last_name': 'Padmanabhan',
                'role': User.Role.ADMIN,
                'department': 'Engineering Leadership',
                'is_staff': True,
                'is_superuser': True,
                'avatar_url': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            }
        )
        if created:
            admin.set_password('password123')
            admin.save()
            self.stdout.write(self.style.SUCCESS('Created Admin user: admin@teamsync.com / password123'))
        else:
            admin.role = User.Role.ADMIN
            admin.set_password('password123')
            admin.save()

        # Create Team Members
        alice, _ = User.objects.get_or_create(
            username='alice',
            defaults={
                'email': 'alice@teamsync.com',
                'first_name': 'Alice',
                'last_name': 'Vance',
                'role': User.Role.MEMBER,
                'department': 'Frontend Engineering',
                'avatar_url': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
            }
        )
        alice.set_password('password123')
        alice.save()

        bob, _ = User.objects.get_or_create(
            username='bob',
            defaults={
                'email': 'bob@teamsync.com',
                'first_name': 'Bob',
                'last_name': 'Miller',
                'role': User.Role.MEMBER,
                'department': 'Backend Engineering',
                'avatar_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
            }
        )
        bob.set_password('password123')
        bob.save()

        charlie, _ = User.objects.get_or_create(
            username='charlie',
            defaults={
                'email': 'charlie@teamsync.com',
                'first_name': 'Charlie',
                'last_name': 'Zhang',
                'role': User.Role.MEMBER,
                'department': 'UI/UX Design',
                'avatar_url': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
            }
        )
        charlie.set_password('password123')
        charlie.save()

        self.stdout.write(self.style.SUCCESS('Created Team Members: Alice, Bob, Charlie (password123)'))

        # Create Projects
        now = timezone.now()
        p1, _ = Project.objects.get_or_create(
            name='Enterprise Cloud Migration',
            defaults={
                'description': 'Migrate on-premise infrastructure to AWS & Google Cloud high-availability cluster.',
                'status': Project.Status.ACTIVE,
                'created_by': admin,
                'start_date': now.date(),
                'end_date': (now + timedelta(days=60)).date(),
            }
        )
        p1.members.set([admin, alice, bob])

        p2, _ = Project.objects.get_or_create(
            name='Mobile Banking Portal 2.0',
            defaults={
                'description': 'Revamp native mobile banking UI with Next.js microfrontend and real-time alerts.',
                'status': Project.Status.ACTIVE,
                'created_by': admin,
                'start_date': (now - timedelta(days=15)).date(),
                'end_date': (now + timedelta(days=45)).date(),
            }
        )
        p2.members.set([admin, alice, charlie])

        p3, _ = Project.objects.get_or_create(
            name='AI Workflow Automation',
            defaults={
                'description': 'Build internal LLM orchestration pipeline for automated client onboarding.',
                'status': Project.Status.PLANNING,
                'created_by': admin,
                'start_date': (now + timedelta(days=10)).date(),
                'end_date': (now + timedelta(days=90)).date(),
            }
        )
        p3.members.set([admin, bob])

        self.stdout.write(self.style.SUCCESS('Created Projects: Enterprise Cloud Migration, Mobile Banking Portal 2.0, AI Workflow Automation'))

        # Create Tasks & Deadline History
        d1 = now + timedelta(days=5)
        d1_old = now - timedelta(days=2)
        d2 = now + timedelta(days=12)
        d3 = now + timedelta(days=20)

        t1, _ = Task.objects.get_or_create(
            title='Design System Tokens & Slate Palette',
            project=p1,
            defaults={
                'description': 'Establish MNC design system color tokens, typography hierarchy, and UI components in Tailwind.',
                'assigned_to': alice,
                'priority': Task.Priority.HIGH,
                'status': Task.Status.COMPLETED,
                'deadline': d1,
                'created_by': admin,
            }
        )

        t2, _ = Task.objects.get_or_create(
            title='Implement JWT Auth & Role Security',
            project=p1,
            defaults={
                'description': 'Configure Django REST Framework SimpleJWT authentication and permission classes for Admin and Team Member.',
                'assigned_to': bob,
                'priority': Task.Priority.URGENT,
                'status': Task.Status.COMPLETED,
                'deadline': d1,
                'created_by': admin,
            }
        )

        t3, _ = Task.objects.get_or_create(
            title='Task Deadline Change Audit Log System',
            project=p1,
            defaults={
                'description': 'Implement backend model & frontend timeline modal to maintain history of previous vs updated task deadlines.',
                'assigned_to': bob,
                'priority': Task.Priority.URGENT,
                'status': Task.Status.IN_PROGRESS,
                'deadline': d2,
                'created_by': admin,
            }
        )
        # Create deadline history for t3
        if not DeadlineHistory.objects.filter(task=t3).exists():
            DeadlineHistory.objects.create(
                task=t3,
                previous_deadline=d1_old,
                new_deadline=d2,
                changed_by=admin,
                reason='Extended sprint timeline due to additional security audit scope.'
            )

        t4, _ = Task.objects.get_or_create(
            title='User Usability Testing & Accessibility Audit',
            project=p2,
            defaults={
                'description': 'Conduct WCAG 2.1 AA accessibility testing across primary mobile banking views.',
                'assigned_to': charlie,
                'priority': Task.Priority.MEDIUM,
                'status': Task.Status.TODO,
                'deadline': d3,
                'created_by': admin,
            }
        )

        # Add comments
        if not TaskComment.objects.filter(task=t3).exists():
            TaskComment.objects.create(
                task=t3,
                author=admin,
                content='Please ensure previous deadline and new deadline timestamps are formatted in UTC/ISO format.'
            )
            TaskComment.objects.create(
                task=t3,
                author=bob,
                content='Updated the serializer to intercept deadline changes on task update! Added history timeline view.'
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded database with demo data!'))
