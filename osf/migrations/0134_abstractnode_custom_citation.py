# -*- coding: utf-8 -*-
# Generated by Django 1.11.13 on 2018-09-25 15:37
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('osf', '0133_merge_20180921_0025'),
    ]

    operations = [
        migrations.AddField(
            model_name='abstractnode',
            name='custom_citation',
            field=models.TextField(blank=True, null=True),
        ),
    ]
