import TrashIcon from '../icons/TrashIcon';

interface Props {
    id: string;
    title: string;
    isActive: boolean;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
}

export default function SidebarItem({ id, title, isActive, onSelect, onDelete }: Props) {
    return (
        <div
            className={`flex items-center mx-2.5 my-1 justify-between p-2 rounded-xl border-1 border-sixth cursor-pointer hover:bg-sixth ${isActive ? ' opacity-60 hover:bg-transparent' : ''}`}
            onClick={() => onSelect(id)}
        >
            <span className="truncate text-fifth dark:text-secondary bg-transparent">{title}</span>
            <button
                onClick={e => { e.stopPropagation(); onDelete(id); }}
                className="text-fifth dark:text-secondary hover:text-sixth dark:hover:text-third"
            >
                <TrashIcon />
            </button>
        </div>
    );
}