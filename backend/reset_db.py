import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'teamsync.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def reset_users():
    print("Deleting extra users created during testing...")
    allowed_usernames = ['admin', 'alice', 'bob', 'charlie']
    deleted_count, _ = User.objects.exclude(username__in=allowed_usernames).delete()
    print(f"Successfully deleted {deleted_count} test users!")
    print(f"Remaining active users: {list(User.objects.values_list('username', flat=True))}")

if __name__ == '__main__':
    reset_users()
