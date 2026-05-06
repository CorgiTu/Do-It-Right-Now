import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createList, getAllLists, deleteList, listExists, createDefaultList } from './lists'
import { initDB } from './tasks'

vi.mock('../utils/uuid', () => ({
  generateId: () => 'test-uuid-' + Date.now() + Math.random(),
}))

describe('lists DB', () => {
  beforeEach(async () => {
    const db = await initDB()
    try {
      const lists = await db.getAll('lists')
      for (const list of lists) {
        await db.delete('lists', list.id)
      }
    } catch {
      // lists store may not exist yet
    }
  })

  it('should create a new list', async () => {
    const list = await createList({ name: '工作', color: '#3B82F6', icon: 'briefcase' })

    expect(list).toHaveProperty('id')
    expect(list.name).toBe('工作')
    expect(list.color).toBe('#3B82F6')
    expect(list.order).toBe(0)
  })

  it('should get all lists', async () => {
    await createList({ name: '工作', color: '#3B82F6', icon: 'briefcase' })
    await createList({ name: '个人', color: '#10B981', icon: 'home' })

    const lists = await getAllLists()
    expect(lists).toHaveLength(2)
    expect(lists[0].name).toBe('工作')
    expect(lists[1].name).toBe('个人')
  })

  it('should delete a list', async () => {
    const list = await createList({ name: '临时', color: '#EF4444', icon: 'trash' })

    await deleteList(list.id)
    const lists = await getAllLists()
    expect(lists).toHaveLength(0)
  })

  it('should check if list exists', async () => {
    await createList({ name: '存在', color: '#3B82F6', icon: 'check' })

    expect(await listExists('存在')).toBe(true)
    expect(await listExists('不存在')).toBe(false)
  })

  it('should create default list if not exists', async () => {
    const list = await createDefaultList()

    expect(list.name).toBe('默认分组')
    expect(list.color).toBe('#3B82F6')
  })

  it('should return existing default list if already exists', async () => {
    const list1 = await createDefaultList()
    const list2 = await createDefaultList()

    expect(list1.id).toBe(list2.id)
  })
})
