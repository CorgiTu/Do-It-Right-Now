import { useState } from 'react'
import { useListStore } from '../store/listStore'
import { useTaskStore } from '../store/taskStore'
import { useDroppable } from '@dnd-kit/core'
import SortableListItem from './SortableListItem'
import ListManager from './ListManager'

interface ListSidebarProps {
  onListSelect: (id: string | 'all') => void
}

export default function ListSidebar({ onListSelect }: ListSidebarProps) {
  const { selectedListId, lists } = useListStore()
  const { tasks } = useTaskStore()
  const [showManager, setShowManager] = useState(false)

  const { setNodeRef } = useDroppable({
    id: 'all-tasks',
  })

  const getTaskCount = (listId: string) => {
    return tasks.filter(t => t.listId === listId && !t.completed).length
  }

  return (
    <aside className="w-72 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] flex flex-col shadow-sm">
      <div className="p-4 border-b border-[var(--color-border)]">
        <h2 className="text-lg font-semibold text-[var(--color-text)] tracking-wide">待办清单</h2>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div ref={setNodeRef}>
          <button
            onClick={() => onListSelect('all')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left group ${
              selectedListId === 'all'
                ? 'bg-[var(--color-accent-light)] bg-opacity-60 text-[var(--color-text)]'
                : 'hover:bg-[var(--color-hover)] text-[var(--color-text-light)] hover:text-[var(--color-text)]'
            }`}
          >
            <span className="text-lg"></span>
            <span className="text-sm truncate">全部任务</span>
            <span className="text-xs opacity-70 ml-auto">{tasks.filter(t => !t.completed).length}</span>
          </button>
        </div>

        {lists.map(list => (
          <div key={list.id} className="relative group">
            <SortableListItem
              list={list}
              isSelected={selectedListId === list.id}
              onSelect={() => onListSelect(list.id)}
              taskCount={getTaskCount(list.id)}
            />
          </div>
        ))}
      </nav>

      <ListManager isOpen={showManager} onClose={() => setShowManager(false)} onOpen={() => setShowManager(true)} />
    </aside>
  )
}
