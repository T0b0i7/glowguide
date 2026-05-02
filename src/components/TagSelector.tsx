import React from 'react';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import { useTags } from '../context';

interface TagSelectorProps {
  selectedTagIds: string[];
  onToggle: (tagId: string) => void;
  onAddTag?: (name: string) => void;
  showAddButton?: boolean;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTagIds,
  onToggle,
  onAddTag,
  showAddButton = true
}) => {
  const { tags } = useTags();

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => {
        const isSelected = selectedTagIds.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => onToggle(tag.id)}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
              ${isSelected
                ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 scale-105'
                : 'opacity-70 hover:opacity-100 hover:scale-105'
              }
            `}
            style={{
              backgroundColor: tag.color,
              color: 'white',
              '--tw-ring-color': tag.color
            } as React.CSSProperties}
          >
            <TagIcon size={12} />
            {tag.name}
            {isSelected && <X size={12} />}
          </button>
        );
      })}

      {showAddButton && onAddTag && (
        <AddTagButton onAdd={onAddTag} />
      )}
    </div>
  );
};

const AddTagButton: React.FC<{ onAdd: (name: string) => void }> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [value, setValue] = React.useState('');

  const handleAdd = () => {
    if (value.trim()) {
      onAdd(value.trim());
      setValue('');
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
      >
        <Plus size={12} />
        Tag
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
        onBlur={() => { if (!value.trim()) setIsOpen(false); }}
        placeholder="Nouveau tag..."
        className="px-3 py-1.5 rounded-full text-sm border border-beauty-soft dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-beauty-accent/20"
        autoFocus
      />
      <button
        type="button"
        onClick={handleAdd}
        className="p-1.5 rounded-full bg-beauty-accent text-white hover:bg-opacity-90 transition-colors"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};
