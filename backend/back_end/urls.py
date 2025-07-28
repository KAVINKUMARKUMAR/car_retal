from django.urls import path
from .views import RegisterView, LoginView,HomePageView
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        "message": "Welcome to the API root. Available endpoints: /login/, /register/"
    })

urlpatterns = [
    path('', api_root),
    path('', HomePageView.as_view(), name='home'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
]

