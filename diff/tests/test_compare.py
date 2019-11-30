import io
import os
import unittest

from diff import compare

dir_path = os.path.dirname(os.path.realpath(__file__))


class CompareTest(unittest.TestCase):

    def setUp(self):
        self.old_snapshot = open(os.path.join(dir_path, 'old.png'), 'rb')
        self.new_snapshot = open(os.path.join(dir_path, 'new.png'), 'rb')

        with open(os.path.join(dir_path, 'diff.png'), 'rb') as file:
            self.diff_snapshot_data = file.read()

    def tearDown(self):
        self.old_snapshot.close()
        self.new_snapshot.close()

    def test_compare_snapshot_differences(self):
        diff_image, difference, pixel_diff = compare.compare(
            self.old_snapshot, self.new_snapshot)
        # diff_image_data = io.BytesIO(diff_image).read()
        # with open(os.path.join(dir_path, 'images', 'diff.png'), 'wb') as write_file:
        #     write_file.write(diff_image_data)
        # self.assertEqual(self.diff_snapshot_data, diff_image_data)
        self.assertEqual(difference, 0.2124267451859876)

    def test_compare_same_snapshots(self):
        old_snapshot2 = open(os.path.join(dir_path, 'old.png'), 'rb')
        diff_image, difference, pixel_diff = compare.compare(
            self.old_snapshot, old_snapshot2)
        self.assertEqual(type(difference), float)
        diff_image_data = io.BytesIO(diff_image).read()
        self.assertEqual(difference, 0)
        old_snapshot2.close()

    def test_compare_switch_images(self):
        diff_image, difference, pixel_diff = compare.compare(
            self.new_snapshot, self.old_snapshot)
        # diff_image_data = io.BytesIO(diff_image).read()
        # with open(os.path.join(dir_path, 'images', 'diff-reverse.png'), 'wb') as write_file:
        #     write_file.write(diff_image_data)
        # self.assertEqual(self.diff_snapshot_data, diff_image_data)
        self.assertEqual(difference, 0.2124267451859876)


if __name__ == '__main__':
    unittest.main()
