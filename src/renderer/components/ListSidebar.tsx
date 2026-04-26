import { useListStore } from '../store/listStore'
import { useDroppable } from '@dnd-kit/core'
import ListManager from './ListManager'
import type { TodoList } from '../db/types'

interface ListSidebarProps {
  onListSelect: (id: string | 'all') => void
  droppableLists: TodoList[]
}

function DroppableListItem({ list, isSelected, onSelect }: { list: TodoList; isSelected: boolean; onSelect: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: `list-${list.id}` })

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-1 transition-all duration-200 ${
        isSelected
          ? 'bg-[var(--color-accent-light)] bg-opacity-30 text-[var(--color-text)] font-medium'
          : isOver
            ? 'bg-[var(--color-hover)] ring-1 ring-[var(--color-accent-light)]'
            : 'hover:bg-[var(--color-hover)] text-[var(--color-text-light)]'
      }`}
      onClick={() => onSelect(list.id)}
    >
      <span
        className="w-3 h-3 rounded-full shadow-sm"
        style={{ backgroundColor: list.color }}
      />
      <span className="text-sm flex-1">{list.name}</span>
    </div>
  )
}

export default function ListSidebar({ onListSelect, droppableLists }: ListSidebarProps) {
  const { lists, selectedListId, selectList } = useListStore()
  const { setNodeRef: setAllRef, isOver: isAllOver } = useDroppable({ id: 'list-all' })

  const handleSelect = (id: string | 'all') => {
    selectList(id)
    onListSelect(id)
  }

  return (
    <aside className="w-64 bg-[var(--color-bg)] border-r border-[var(--color-border)] p-5 flex flex-col h-full shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1 tracking-wide">待办清单</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div
          ref={setAllRef}
          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-1 transition-all duration-200 ${
            selectedListId === 'all'
              ? 'bg-[var(--color-accent-light)] bg-opacity-30 text-[var(--color-text)] font-medium'
              : isAllOver
                ? 'bg-[var(--color-hover)] ring-1 ring-[var(--color-accent-light)]'
                : 'hover:bg-[var(--color-hover)] text-[var(--color-text-light)]'
          }`}
          onClick={() => handleSelect('all')}
        >
          <span className="text-base">📋</span>
          <span className="text-sm">全部任务</span>
        </div>

        <div className="mt-3">
          {lists.map((list) => (
            <DroppableListItem
              key={list.id}
              list={list}
              isSelected={selectedListId === list.id}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-[var(--color-border)] mt-4">
        <ListManager />
      </div>
    </aside>
  )
}
