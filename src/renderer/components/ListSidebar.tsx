import { useState } from 'react'
import { useListStore } from '../store/listStore'
import { useTaskStore } from '../store/taskStore'
import { useDroppable } from '@dnd-kit/core'
import SortableListItem from './SortableListItem'
import ListManager from './ListManager'
import TagCloud from './TagCloud'

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
    <aside className="w-72 bg-gray-50/80 flex flex-col">
      <div className="p-5 border-b border-gray-200/60">
        <h2 className="text-lg font-semibold text-coinbase-ink">待办清单</h2>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div ref={setNodeRef}>
          <button
            onClick={() => onListSelect('all')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-coinbase-sm transition-all text-left group ${
              selectedListId === 'all'
                ? 'bg-coinbase-primary/10 text-coinbase-ink font-medium'
                : 'hover:bg-coinbase-surface-strong text-coinbase-muted hover:text-coinbase-body'
            }`}
          >
            <span className="text-lg"></span>
            <span className="text-sm truncate">全部任务</span>
            <span className="text-xs text-gray-400 ml-auto">{tasks.filter(t => !t.completed).length}</span>
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

        <div className="pt-4">
          <TagCloud />
        </div>
      </nav>

      <ListManager isOpen={showManager} onClose={() => setShowManager(false)} onOpen={() => setShowManager(true)} />
    </aside>
  )
}
