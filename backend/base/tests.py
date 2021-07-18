from django.test import TestCase
from rest_framework.test import APIClient
from .models import Product
from django.contrib.auth.models import User


class ProductTestCase(TestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(username='test_user1',password='password1')
        Product.objects.create(
            user=self.user1,
            name='product1',
            brand='brand1',
            category='category1',
            description='description1'
            )
    
    def test_create_product(self):
        product = Product.objects.create(
            user = self.user1,
            name='product2',
            brand='brand2',
            category='category1',
            description='description2'
        )
        self.assertEqual(product._id,2)
