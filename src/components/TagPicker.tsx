import { useState, useRef, useEffect } from 'react'
import { Tag } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

interface TagPickerProps {
  selectedTags: Tag[]
  availableTags: Tag[]
  onTagAdd: (tag: Tag) => void
  onTagRemove: (tagId: string) => void
  onTagCreate: (name: string, color: string) => Promise<void>
}

const TAG_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Green', value: '#10B981' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Gray', value: '#6B7280' }
]

export default function TagPicker({
  selectedTags,
  availableTags,
  onTagAdd,
  onTagRemove,
  onTagCreate
}: TagPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0].value)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsCreating(false)
        setSearchQuery('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const filteredTags = availableTags.filter(tag =>
    !selectedTags.find(t => t.id === tag.id) &&
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return

    await onTagCreate(newTagName.trim(), selectedColor)
    setNewTagName('')
    setIsCreating(false)
    setSearchQuery('')
    setSelectedColor(TAG_COLORS[0].value)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium mb-2">
        Tags
      </label>

      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-white"
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
            <button
              type="button"
              onClick={() => onTagRemove(tag.id)}
              className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
            >
              <span className="material-symbols-outlined text-xs">close</span>
            </button>
          </span>
        ))}
      </div>

      {/* Add Tag Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen)
          setTimeout(() => inputRef.current?.focus(), 100)
        }}
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded
                 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left
                 flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-sm">add</span>
        Add tag
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-20 mt-2 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
          >
            {!isCreating ? (
              <>
                {/* Search */}
                <div className="p-2 border-b border-gray-200 dark:border-gray-800">
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tags..."
                    aria-label="Search tags"
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-950 rounded
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Tag List */}
                <div className="max-h-48 overflow-y-auto">
                  {filteredTags.length > 0 ? (
                    filteredTags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => {
                          onTagAdd(tag)
                          setSearchQuery('')
                        }}
                        className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-800 
                                 flex items-center gap-2 transition-colors"
                      >
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </button>
                    ))
                  ) : searchQuery ? (
                    <div className="px-3 py-8 text-center text-sm text-gray-500">
                      No tags found
                    </div>
                  ) : (
                    <div className="px-3 py-8 text-center text-sm text-gray-500">
                      No tags available
                    </div>
                  )}
                </div>

                {/* Create New */}
                <div className="p-2 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(true)
                      setTimeout(() => inputRef.current?.focus(), 100)
                    }}
                    className="w-full px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950
                             rounded transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    Create new tag
                  </button>
                </div>
              </>
            ) : (
              /* Create Tag Form */
              <div className="p-4">
                <h4 className="text-sm font-medium mb-3">Create New Tag</h4>
                
                <input
                  ref={inputRef}
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Tag name"
                  aria-label="New tag name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded mb-3
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleCreateTag()
                    }
                  }}
                />

                <div className="mb-3">
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">
                    Color
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {TAG_COLORS.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setSelectedColor(color.value)}
                        className={`w-full aspect-square rounded border-2 transition-all ${
                          selectedColor === color.value
                            ? 'border-gray-900 dark:border-gray-100 scale-110'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false)
                      setNewTagName('')
                      setSelectedColor(TAG_COLORS[0].value)
                    }}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded
                             hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim()}
                    className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded
                             hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Create
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
