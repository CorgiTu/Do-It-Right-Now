import { describe, it, expect, beforeEach } from 'vitest'
import type { Tag, TaskTag } from './types'
import { TAG_COLORS, DEFAULT_TAG_COLOR } from './types'
import {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
  tagExists,
  addTagToTask,
  removeTagFromTask,
  getTagsByTaskId,
  getTasksByTagId,
  deleteAllTaskTags,
} from './tags'

describe('Tags DB Layer', () => {
  beforeEach(async () => {
    const tags = await getAllTags()
    for (const tag of tags) {
      await deleteTag(tag.id)
    }
  })

  describe('createTag', () => {
    it('should create a tag with all required fields', async () => {
      const tag = await createTag({ name: '工作', color: '#FF5722' })

      expect(tag).toBeDefined()
      expect(tag.id).toBeDefined()
      expect(tag.name).toBe('工作')
      expect(tag.color).toBe('#FF5722')
      expect(tag.usageCount).toBe(0)
      expect(tag.createdAt).toBeDefined()
    })

    it('should create tag with default color if not provided', async () => {
      const tag = await createTag({ name: '默认标签' })

      expect(tag.color).toBe(DEFAULT_TAG_COLOR)
    })

    it('should throw error when creating duplicate tag name (case insensitive)', async () => {
      await createTag({ name: '工作', color: '#FF5722' })

      await expect(createTag({ name: '工作', color: '#2196F3' })).rejects.toThrow()
    })

    it('should throw error for case-insensitive duplicate', async () => {
      await createTag({ name: 'Work', color: '#FF5722' })

      await expect(createTag({ name: 'work', color: '#2196F3' })).rejects.toThrow()
    })

    it('should throw error when name is empty', async () => {
      await expect(createTag({ name: '' })).rejects.toThrow()
    })

    it('should throw error when name exceeds 20 characters', async () => {
      await expect(createTag({ name: '这是一段很长的标签名称超过二十个字符啊真的超过了' })).rejects.toThrow()
    })
  })

  describe('getAllTags', () => {
    it('should return empty array initially', async () => {
      const tags = await getAllTags()
      expect(tags).toEqual([])
    })

    it('should return all created tags', async () => {
      await createTag({ name: '工作', color: '#FF5722' })
      await createTag({ name: '生活', color: '#4CAF50' })

      const tags = await getAllTags()
      expect(tags).toHaveLength(2)
      expect(tags.map(t => t.name)).toContain('工作')
      expect(tags.map(t => t.name)).toContain('生活')
    })

    it('should return tags sorted by creation time descending', async () => {
      const tag1 = await createTag({ name: 'first', color: '#FF5722' })
      await new Promise(r => setTimeout(r, 10))
      const tag2 = await createTag({ name: 'second', color: '#4CAF50' })

      const tags = await getAllTags()
      expect(tags[0].name).toBe('second')
      expect(tags[1].name).toBe('first')
    })
  })

  describe('getTagById', () => {
    it('should return the tag by id', async () => {
      const tag = await createTag({ name: '工作', color: '#FF5722' })

      const found = await getTagById(tag.id)
      expect(found).toBeDefined()
      expect(found?.name).toBe('工作')
    })

    it('should return undefined for non-existent id', async () => {
      const found = await getTagById('non-existent')
      expect(found).toBeUndefined()
    })
  })

  describe('updateTag', () => {
    it('should update tag name', async () => {
      const tag = await createTag({ name: '旧名称', color: '#FF5722' })
      await new Promise(r => setTimeout(r, 10))

      const updated = await updateTag(tag.id, { name: '新名称' })
      expect(updated.name).toBe('新名称')

      const found = await getTagById(tag.id)
      expect(found?.name).toBe('新名称')
    })

    it('should update tag color', async () => {
      const tag = await createTag({ name: '工作', color: '#FF5722' })

      const updated = await updateTag(tag.id, { color: '#4CAF50' })
      expect(updated.color).toBe('#4CAF50')
    })

    it('should throw error when updating to duplicate name', async () => {
      await createTag({ name: '工作', color: '#FF5722' })
      const tag2 = await createTag({ name: '生活', color: '#4CAF50' })

      await expect(updateTag(tag2.id, { name: '工作' })).rejects.toThrow()
    })

    it('should throw error when tag not found', async () => {
      await expect(updateTag('non-existent', { name: 'new' })).rejects.toThrow()
    })
  })

  describe('deleteTag', () => {
    it('should remove tag from database', async () => {
      const tag = await createTag({ name: '删除标签', color: '#FF5722' })
      await deleteTag(tag.id)

      const tags = await getAllTags()
      expect(tags).toHaveLength(0)
    })

    it('should only delete the specified tag', async () => {
      await createTag({ name: '保留', color: '#FF5722' })
      const tag2 = await createTag({ name: '删除', color: '#4CAF50' })

      await deleteTag(tag2.id)

      const tags = await getAllTags()
      expect(tags).toHaveLength(1)
      expect(tags[0].name).toBe('保留')
    })
  })

  describe('tagExists', () => {
    it('should return true for existing tag name', async () => {
      await createTag({ name: '工作', color: '#FF5722' })

      const exists = await tagExists('工作')
      expect(exists).toBe(true)
    })

    it('should return false for non-existing tag', async () => {
      const exists = await tagExists('不存在的标签')
      expect(exists).toBe(false)
    })

    it('should be case insensitive', async () => {
      await createTag({ name: 'Work', color: '#FF5722' })

      const exists = await tagExists('work')
      expect(exists).toBe(true)
    })
  })

  describe('Task-Tag Association', () => {
    it('should add a tag to a task', async () => {
      const tag = await createTag({ name: '工作', color: '#FF5722' })

      await addTagToTask('task-1', tag.id)

      const tags = await getTagsByTaskId('task-1')
      expect(tags).toHaveLength(1)
      expect(tags[0].tagId).toBe(tag.id)
    })

    it('should not allow duplicate task-tag association', async () => {
      const tag = await createTag({ name: '工作', color: '#FF5722' })

      await addTagToTask('task-1', tag.id)
      await addTagToTask('task-1', tag.id)

      const tags = await getTagsByTaskId('task-1')
      expect(tags).toHaveLength(1)
    })

    it('should remove a tag from a task', async () => {
      const tag = await createTag({ name: '工作', color: '#FF5722' })

      await addTagToTask('task-1', tag.id)
      await removeTagFromTask('task-1', tag.id)

      const tags = await getTagsByTaskId('task-1')
      expect(tags).toHaveLength(0)
    })

    it('should get all tags for a task', async () => {
      const tag1 = await createTag({ name: '工作', color: '#FF5722' })
      const tag2 = await createTag({ name: '紧急', color: '#E91E63' })

      await addTagToTask('task-1', tag1.id)
      await addTagToTask('task-1', tag2.id)

      const tags = await getTagsByTaskId('task-1')
      expect(tags).toHaveLength(2)
      expect(tags.map(t => t.tagId)).toContain(tag1.id)
      expect(tags.map(t => t.tagId)).toContain(tag2.id)
    })

    it('should get all tasks for a tag', async () => {
      const tag = await createTag({ name: '工作', color: '#FF5722' })

      await addTagToTask('task-1', tag.id)
      await addTagToTask('task-2', tag.id)
      await addTagToTask('task-3', tag.id)

      const taskIds = await getTasksByTagId(tag.id)
      expect(taskIds).toHaveLength(3)
      expect(taskIds).toContain('task-1')
      expect(taskIds).toContain('task-2')
      expect(taskIds).toContain('task-3')
    })

    it('should delete all task tags when tag is deleted', async () => {
      const tag = await createTag({ name: '工作', color: '#FF5722' })

      await addTagToTask('task-1', tag.id)
      await addTagToTask('task-2', tag.id)

      await deleteAllTaskTags(tag.id)

      const taskIds = await getTasksByTagId(tag.id)
      expect(taskIds).toHaveLength(0)
    })

    it('should persist task-tag associations', async () => {
      const tag = await createTag({ name: '持久化测试', color: '#FF5722' })

      await addTagToTask('persist-task', tag.id)

      const tags = await getTagsByTaskId('persist-task')
      expect(tags).toHaveLength(1)
      expect(tags[0].tagId).toBe(tag.id)
    })
  })
})
