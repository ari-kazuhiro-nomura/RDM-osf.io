# -*- coding: utf-8 -*-
# Generated by Django 1.11.15 on 2018-10-29 17:01
from __future__ import unicode_literals

from django.db import migrations
from django.db.models import OuterRef, Subquery
from osf.models import NodeLog, Node
from django_bulk_update.helper import bulk_update


def untransfer_forked_date(state, schema):
    """
    Reverse mig.

    Revert the last logged date of nodes whose last log is forking to the previous log's date
    """
    newest = NodeLog.objects.filter(node=OuterRef('pk')).order_by('-date')
    nodes = Node.objects.filter(is_fork=True).annotate(latest_log=Subquery(newest.values('action')[:1])).filter(latest_log='node_forked')
    for node in nodes:
        node.last_logged = node.logs.order_by('-date')[1].date

    bulk_update(nodes, update_fields=['last_logged'])

def transfer_forked_date(state, schema):
    """
    If the most recent node log is forking, transfer that log's date to the node's last_logged field
    """
    newest = NodeLog.objects.filter(node=OuterRef('pk')).order_by('-date')
    nodes = Node.objects.filter(is_fork=True).annotate(latest_log=Subquery(newest.values('action')[:1])).filter(latest_log='node_forked')
    for node in nodes:
        node.last_logged = node.logs.first().date

    bulk_update(nodes, update_fields=['last_logged'])


class Migration(migrations.Migration):

    dependencies = [
        ('osf', '0157_add_storage_usage_flag'),
    ]

    operations = [
        migrations.RunPython(
            transfer_forked_date, untransfer_forked_date
        ),
    ]
