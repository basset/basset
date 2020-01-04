import io
import unittest
from unittest.mock import patch, Mock

from diff import diff


@patch('diff.diff.compare')
@patch('diff.diff.get_file')
@patch('diff.diff.upload_file')
@patch('diff.diff.uuid.uuid4')
@patch('diff.diff.get_sha1')
class DiffTest(unittest.TestCase):

    def test_diff(self, get_sha1_mock, uuid_mock, upload_file_mock, get_file_mock, compare_mock):
        compare_mock.return_value = [b'', 0, 0, []]
        uuid_mock.return_value = Mock(hex="1234")
        diff_location, difference, image_location, diff_hash, flake_matched, centers  = diff.diff_snapshot(io.BytesIO(),
                                                                                                 'organization_id',
                                                                                                 'project_id',
                                                                                                 'build_id', 'browser',
                                                                                                 'title', 1280,
                                                                                                 'http://path/to/compare/snapshot',
                                                                                                 [])
        assert difference == 0
        assert image_location == 'http://path/to/compare/snapshot'
        assert compare_mock.called
        assert get_file_mock.called
        assert not upload_file_mock.called
        assert not get_sha1_mock.called

    def test_flake_matched(self, get_sha1_mock, uuid_mock, upload_file_mock, get_file_mock, compare_mock):
        compare_mock.return_value = [b'', 0.2, 0.02, []]
        uuid_mock.return_value = Mock(hex="1234")
        get_sha1_mock.return_value = '1234ea'
        diff_location, difference, image_location, diff_hash, flake_matched, centers = diff.diff_snapshot(io.BytesIO(),
                                                                                                 'organization_id',
                                                                                                 'project_id',
                                                                                                 'build_id', 'browser',
                                                                                                 'title', 1280,
                                                                                                 'http://path/to/compare/snapshot',
                                                                                                 ['1234ea'])
        assert image_location == 'http://path/to/compare/snapshot'
        assert flake_matched == True
        assert diff_hash == '1234ea'
        assert get_file_mock.called
        assert get_sha1_mock.called
        assert not upload_file_mock.called

    def test_snapshot_saved(self, get_sha1_mock, uuid_mock, upload_file_mock, get_file_mock, compare_mock):
        get_file_mock.return_value = b''
        compare_mock.return_value = [b'', 0.2, 0.02, []]
        uuid_mock.return_value = Mock(hex="1234")
        get_sha1_mock.return_value = '1234ea'
        diff_location, difference, image_location, diff_hash, flake_matched, centers = diff.diff_snapshot(io.BytesIO(),
                                                                                                 'organization_id',
                                                                                                 'project_id',
                                                                                                 'build_id', 'browser',
                                                                                                 'title', 1280,
                                                                                                 'http://path/to/compare/snapshot',
                                                                                                 [], True)
        assert image_location != 'http://path/to/compare/snapshot'
        assert flake_matched == False
        assert get_file_mock.called
        assert get_sha1_mock.called
        assert upload_file_mock.called


if __name__ == '__main__':
    unittest.main()
