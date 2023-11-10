from django.urls import path
from . import views  # Import your views module
from .views import ThreadListCreateView, ThreadDetailView, UserThreadListView, MessageCreateView, MessageListView, upload_and_replace_data, UserRegisterView, UserLoginView, UserUpdateView, UserDetailsView

urlpatterns = [
    # Other URL patterns
    path('api/threads/', ThreadListCreateView.as_view(), name='thread-list'),
    path('api/threads/<int:pk>/', ThreadDetailView.as_view(), name='thread-detail'),
    path('api/messages/create/', MessageCreateView.as_view(), name='message-create'),
    path('api/messages/thread/<int:thread_id>/', MessageListView.as_view(), name='message-list'),
    path('api/users/threads/', UserThreadListView.as_view(), name='thread-list'),
    path('upload-and-replace-data/', views.upload_and_replace_data, name='upload-and-replace-data'),
    path('api/users/register/', UserRegisterView.as_view(), name='user-register'),
    path('api/users/login/', UserLoginView.as_view(), name='user-login'),
    path('api/users/details/', UserDetailsView.as_view(), name='user-details'),
    path('api/users/update/', UserUpdateView.as_view(), name='user-update'),
]