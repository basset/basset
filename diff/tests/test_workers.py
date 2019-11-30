import os
import threading
import time
import unittest
from signal import SIGTERM

from workers import rabbitmq


class RabbitMQWorker(unittest.TestCase):

    def setUp(self):
        pid = os.getpid()

        def trigger_signal():
            time.sleep(0.5)
            os.kill(pid, SIGTERM)

        thread = threading.Thread(target=trigger_signal)
        thread.daemon = True
        thread.start()

    def tearDown(self):
        pass

    def test_block_signals_stops_sigterm(self):
        working = False
        try:
            with rabbitmq.block_signals():
                self.assertTrue(rabbitmq.handling_callback)
                time.sleep(1)
                working = True
        except SystemExit:
            self.assertFalse(rabbitmq.handling_callback)
            self.assertTrue(rabbitmq.received_signal)
            self.assertTrue(working)

    def test_block_signals_exits_on_sigterm(self):
        count = 0
        while count < 5:
            try:
                with rabbitmq.block_signals():
                    self.assertTrue(rabbitmq.handling_callback)
                    time.sleep(0.2)
            except SystemExit:
                self.assertFalse(rabbitmq.handling_callback)
                self.assertTrue(rabbitmq.received_signal)
                self.assertLess(count, 5)
                break
