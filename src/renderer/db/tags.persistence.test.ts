import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  createTag,
  getAllTags,
  updateTag,
  deleteTag,
  addTagToTask,
  removeTagFromTask,
  getTagsByTaskId,
  getTasksByTagId,
} from '../db/tags'
import { useTagStore } from '../store/tagStore'

describe('Tag Persistence (T12)', () => {
  beforeEach(async () => {
    const tags = await getAllTags()
    for (const tag of tags) {
      await deleteTag(tag.id)
    }
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should persist tags after creation', async () => {
    await createTag({ name: '持久化标签', color: '#FF5722' })

    const tags = await getAllTags()
    expect(tags).toHaveLength(1)
    expect(tags[0].name).toBe('持久化标签')

    const storedData = localStorage.getItem('todo-app-tags')
    expect(storedData).not.toBeNull()
    const parsed = JSON.parse(storedData!)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].name).toBe('持久化标签')
  })

  it('should persist tag updates', async () => {
    const tag = await createTag({ name: '原始名称', color: '#FF5722' })
    await updateTag(tag.id, { name: '更新名称', color: '#4CAF50' })

    const storedData = localStorage.getItem('todo-app-tags')
    const parsed = JSON.parse(storedData!)
    expect(parsed[0].name).toBe('更新名称')
    expect(parsed[0].color).toBe('#4CAF50')
  })

  it('should persist tag deletions', async () => {
    const tag = await createTag({ name: '待删除标签', color: '#FF5722' })
    await deleteTag(tag.id)

    const tags = await getAllTags()
    expect(tags).toHaveLength(0)

    const storedData = localStorage.getItem('todo-app-tags')
    const parsed = JSON.parse(storedData!)
    expect(parsed).toHaveLength(0)
  })

  it('should persist task-tag associations', async () => {
    const tag = await createTag({ name: '关联标签', color: '#FF5722' })
    await addTagToTask('persist-task-1', tag.id)

    const storedTaskTags = localStorage.getItem('todo-app-task-tags')
    expect(storedTaskTags).not.toBeNull()
    const parsed = JSON.parse(storedTaskTags!)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].taskId).toBe('persist-task-1')
    expect(parsed[0].tagId).toBe(tag.id)
  })

  it('should persist tag usage count updates', async () => {
    const tag = await createTag({ name: '计数标签', color: '#FF5722' })
    expect(tag.usageCount).toBe(0)

    await addTagToTask('count-task-1', tag.id)
    const tagsAfterAdd = await getAllTags()
    expect(tagsAfterAdd[0].usageCount).toBe(1)

    await removeTagFromTask('count-task-1', tag.id)
    const tagsAfterRemove = await getAllTags()
    expect(tagsAfterRemove[0].usageCount).toBe(0)

    const storedData = localStorage.getItem('todo-app-tags')
    const parsed = JSON.parse(storedData!)
    expect(parsed[0].usageCount).toBe(0)
  })

  it('should persist multiple task-tag associations', async () => {
    const tag1 = await createTag({ name: '标签一', color: '#FF5722' })
    const tag2 = await createTag({ name: '标签二', color: '#4CAF50' })

    await addTagToTask('multi-task-1', tag1.id)
    await addTagToTask('multi-task-1', tag2.id)
    await addTagToTask('multi-task-2', tag1.id)

    const tasksForTag1 = await getTasksByTagId(tag1.id)
    expect(tasksForTag1).toHaveLength(2)
    expect(tasksForTag1).toContain('multi-task-1')
    expect(tasksForTag1).toContain('multi-task-2')

    const tasksForTag2 = await getTasksByTagId(tag2.id)
    expect(tasksForTag2).toHaveLength(1)
    expect(tasksForTag2).toContain('multi-task-1')
  })
})
