import type { Response } from 'express'
import { prisma } from '../lib/prisma.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'

async function assertOwnsCat(catProfileId: string, ownerId: string) {
  const cat = await prisma.catProfile.findUnique({ where: { id: catProfileId } })
  if (!cat || cat.ownerId !== ownerId) return null
  return cat
}

export async function createHealthNote(req: AuthRequest, res: Response) {
  const ownerId = req.userId!
  const { id: catProfileId } = req.params
  const { title, content, noteDate } = req.body as { title?: string; content: string; noteDate?: string }

  if (!content?.trim()) {
    res.status(400).json({ error: 'Note content is required' })
    return
  }

  if (!catProfileId || typeof catProfileId !== 'string') {
    res.status(400).json({ error: 'Invalid cat profile ID' })
    return
  }

  const cat = await assertOwnsCat(catProfileId, ownerId)
  if (!cat) { res.status(404).json({ error: 'Cat profile not found' }); return }

  const note = await prisma.healthNote.create({
    data: {
      catProfileId,
      title: title?.trim() || null,
      content: content.trim(),
      noteDate: noteDate ? new Date(noteDate) : undefined,
    },
  })

  res.status(201).json(note)
}

export async function listHealthNotes(req: AuthRequest, res: Response) {
  const ownerId = req.userId!
  const { id: catProfileId } = req.params

  if (!catProfileId || typeof catProfileId !== 'string') {
    res.status(400).json({ error: 'Invalid cat profile ID' })
    return
  }

  const cat = await assertOwnsCat(catProfileId, ownerId)
  if (!cat) { res.status(404).json({ error: 'Cat profile not found' }); return }

  const notes = await prisma.healthNote.findMany({
    where: { catProfileId },
    orderBy: { noteDate: 'desc' },
  })

  res.json(notes)
}

export async function updateHealthNote(req: AuthRequest, res: Response) {
  const ownerId = req.userId!
  const { id: catProfileId, noteId } = req.params
  const { title, content, noteDate } = req.body as { title?: string; content?: string; noteDate?: string }

  if (!catProfileId || typeof catProfileId !== 'string') {
    res.status(400).json({ error: 'Invalid cat profile ID' })
    return
  }

  const cat = await assertOwnsCat(catProfileId, ownerId)
  if (!cat) { res.status(404).json({ error: 'Cat profile not found' }); return }

  const note = await prisma.healthNote.findUnique({ where: { id: noteId } })
  if (!note || note.catProfileId !== catProfileId) {
    res.status(404).json({ error: 'Health note not found' })
    return
  }

  const updated = await prisma.healthNote.update({
    where: { id: noteId },
    data: {
      title: title !== undefined ? (title.trim() || null) : note.title,
      content: content !== undefined ? content.trim() : note.content,
      noteDate: noteDate !== undefined ? new Date(noteDate) : note.noteDate,
    },
  })

  res.json(updated)
}

export async function deleteHealthNote(req: AuthRequest, res: Response) {
  const ownerId = req.userId!
  const { id: catProfileId, noteId } = req.params

  if (!catProfileId || typeof catProfileId !== 'string') {
    res.status(400).json({ error: 'Invalid cat profile ID' })
    return
  }
  
  const cat = await assertOwnsCat(catProfileId, ownerId)
  if (!cat) { res.status(404).json({ error: 'Cat profile not found' }); return }

  const note = await prisma.healthNote.findUnique({ where: { id: noteId } })
  if (!note || note.catProfileId !== catProfileId) {
    res.status(404).json({ error: 'Health note not found' })
    return
  }

  await prisma.healthNote.delete({ where: { id: noteId } })
  res.status(204).send()
}