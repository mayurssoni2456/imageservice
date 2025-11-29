import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { validate } from '../middleware/validate.js';

const router = Router();

// Health check endpoint
router.get('/', (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Example POST endpoint with validation
const greetSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
});

router.post(
  '/greet',
  validate(greetSchema),
  (req: Request, res: Response): void => {
    const { name } = req.body as { name: string };
    res.status(200).json({
      success: true,
      message: `Hello ${name}!`,
    });
  }
);

export default router;
