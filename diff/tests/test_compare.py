import io
import os
import unittest

from diff import compare

dir_path = os.path.dirname(os.path.realpath(__file__))


class CompareTest(unittest.TestCase):

    def setUp(self):
        self.old_snapshot = open(os.path.join(dir_path, 'old.png'), 'rb')
        self.new_snapshot = open(os.path.join(dir_path, 'new.png'), 'rb')
        self.invite_snapshot = open(os.path.join(dir_path, 'invites1.png'), 'rb')
        self.invite_old_snapshot = open(os.path.join(dir_path, 'invites2.png'), 'rb')
        self.delete_invite_old_snapshot = open(os.path.join(dir_path, 'delete-invite.png'), 'rb')
        self.delete_invite_snapshot = open(os.path.join(dir_path, 'delete-invite2.png'), 'rb')
        # with open(os.path.join(dir_path, 'diff.png'), 'rb') as file:
        #     self.diff_snapshot_data = file.read()

    def tearDown(self):
        self.old_snapshot.close()
        self.new_snapshot.close()

    def test_compare_invites_snapshots(self):
        diff_image, difference, pixel_diff, centers = compare.compare(
            self.invite_old_snapshot, self.invite_snapshot)
        # diff_image_data = io.BytesIO(diff_image).read()
        # with open(os.path.join(dir_path, 'invites-diff.png'), 'wb') as write_file:
        #     write_file.write(diff_image_data)
        self.assertEqual(difference, 0.6003015396253474)
        self.assertEqual(len(centers), 4)
        self.assertListEqual(
            centers,
            [(605.5, 440.5), (407.0, 388.0), (847.0, 390.0), (602.0, 391.5)])

    def test_compare_delete_invites_snapshots(self):
        diff_image, difference, pixel_diff, centers = compare.compare(
            self.delete_invite_old_snapshot, self.delete_invite_snapshot)
        diff_image_data = io.BytesIO(diff_image).read()
        with open(os.path.join(dir_path, 'delete-invite-diff.png'), 'wb') as write_file:
            write_file.write(diff_image_data)
        self.assertEqual(self.diff_snapshot_data, diff_image_data)
        self.assertEqual(difference,  0.5202913847066852)
        self.assertEqual(len(centers), 3)
        self.assertListEqual(
            centers,
            [(407.0, 388.5), (847.0387573242188, 390.0), (602.0, 392.0)])

    def test_compare_snapshot_differences(self):
        diff_image, difference, pixel_diff, centers = compare.compare(
            self.old_snapshot, self.new_snapshot)
        # diff_image_data = io.BytesIO(diff_image).read()
        # with open(os.path.join(dir_path, 'old-new-diff.png'), 'wb') as write_file:
        #     write_file.write(diff_image_data)
        self.assertEqual(difference, 0.2666917153356021)
        self.assertEqual(len(centers), 2)
        self.assertListEqual(centers, [(1121.0, 176.5), (366.5, 33.5)])

    def test_compare_same_snapshots(self):
        old_snapshot2 = open(os.path.join(dir_path, 'old.png'), 'rb')
        diff_image, difference, pixel_diff, centers = compare.compare(
            self.old_snapshot, old_snapshot2)
        self.assertEqual(type(difference), float)
        self.assertEqual(difference, 0)
        self.assertEqual(centers, [])
        old_snapshot2.close()

    def test_compare_switch_images(self):
        diff_image, difference, pixel_diff, centers = compare.compare(
            self.new_snapshot, self.old_snapshot)
        # diff_image_data = io.BytesIO(diff_image).read()
        # with open(os.path.join(dir_path, 'images', 'diff-reverse.png'), 'wb') as write_file:
        #     write_file.write(diff_image_data)
        # self.assertEqual(self.diff_snapshot_data, diff_image_data)
        self.assertEqual(difference, 0.2666917153356021)
        self.assertListEqual(centers, [(1121.0, 176.5), (366.5, 33.5)])


if __name__ == '__main__':
    unittest.main()
