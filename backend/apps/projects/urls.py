from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, ProjectInvitationViewSet

router = DefaultRouter()
router.register(r'invitations', ProjectInvitationViewSet, basename='project-invitation')
router.register(r'', ProjectViewSet, basename='project')

urlpatterns = [
    path('', include(router.urls)),
]
