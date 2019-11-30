import boto3
import botocore
import io
import os

from .settings import *


def setup_s3():
    return boto3.resource(
        's3',
        endpoint_url=S3_ENDPOINT,
        config=botocore.client.Config(signature_version='s3v4')
    )


def setup_client():
    return boto3.client(
        's3',
        endpoint_url=S3_ENDPOINT,
        config=botocore.client.Config(signature_version='s3v4')
    )


def get_file(key, bucket=SCREENSHOT_BUCKET):
    s3 = setup_s3()
    try:
        obj = s3.Bucket(bucket).Object(key).get()
        return obj['Body']
    except botocore.exceptions.ClientError as e:
        if e.response['Error']['Code'] == "404":
            print("The object does not exist.")
        else:
            raise


def upload_file(f, key):
    s3 = setup_s3()
    s3.Bucket(SCREENSHOT_BUCKET).upload_fileobj(f, key)


def list_files(path):
    s3 = setup_s3()
    return [file for file in s3.Bucket(SCREENSHOT_BUCKET).objects.filter(Prefix=path)]


def create_presigned_url(key):
    s3_client = setup_client()
    params = {
        'Bucket': ASSETS_BUCKET,
        'Key': key,
    }
    expiration = 60
    return s3_client.generate_presigned_url('get_object',
                                            Params=params,
                                            ExpiresIn=expiration)
