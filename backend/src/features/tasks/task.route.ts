import express from 'express';
import { z } from 'zod';
import Task from './task.model';
import { protect, AuthRequest } from '../../middleware/auth';

const router = express.Router();

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

router.route('/')
  .get(protect, async (req: AuthRequest, res) => {
    try {
      const tasks = await Task.find({ user: req.user._id, deletedAt: null }).sort({ createdAt: -1 });
      res.json({ success: true, data: tasks });
    } catch (error: any) {
      console.error('Fetch tasks error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  })
  .post(protect, async (req: AuthRequest, res) => {
    try {
      const validatedData = taskSchema.parse(req.body);
      const task = await Task.create({
        ...validatedData,
        user: req.user._id,
      });
      res.status(201).json({ success: true, data: task });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: error.issues?.[0]?.message || 'Validation error' });
      }
      console.error('Create task error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

router.route('/:id')
  .put(protect, async (req: AuthRequest, res) => {
    try {
      const validatedData = taskSchema.partial().parse(req.body);
      const task = await Task.findById(req.params.id);

      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      if (task.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ success: false, error: 'User not authorized' });
      }

      const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        { $set: validatedData },
        { new: true }
      );
      res.json({ success: true, data: updatedTask });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: error.issues?.[0]?.message || 'Validation error' });
      }
      console.error('Update task error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  })
  .delete(protect, async (req: AuthRequest, res) => {
    try {
      const task = await Task.findById(req.params.id);

      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      if (task.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ success: false, error: 'User not authorized' });
      }

      await Task.findByIdAndUpdate(req.params.id, { $set: { deletedAt: new Date() } });
      res.json({ success: true, data: { message: 'Task removed' } });
    } catch (error: any) {
      console.error('Delete task error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

export default router;
