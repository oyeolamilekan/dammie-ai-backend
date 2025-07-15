import express from 'express';
import user from './user.routes';
import webhook from './webhook.route';

const router = express.Router();
router.use('/users', user);
router.use('/webhooks', webhook);

export default router;