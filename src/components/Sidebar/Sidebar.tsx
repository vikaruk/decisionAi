import type { Session } from '../../types';
import ThemeToggle from '../ThemeToggle';
import SidebarItem from './SidebarItem';

interface Props {
    sessions: Session[];
    currentSessionId: string | null;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    sidebarOpen: boolean;
    onClose: () => void;
    onNew: () => void;
}

export default function Sidebar({ sessions, currentSessionId, onSelect, onDelete, sidebarOpen, onClose, onNew }: Props) {
    return (
        <>
            {sidebarOpen && <div className="fixed inset-0 bg-opacity-50 z-20 md:hidden " onClick={onClose} />}
            <aside className={`fixed flex flex-col inset-y-0 w-64 z-30 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:z-auto`}>
                <div className="flex items-center bg-primary dark:bg-third dark:border-b justify-center p-4 h-[74px] border-r border-sixth dark:border-fourth">
                    <span className="text-xl font-semibold text-secondary">Чати</span>
                </div>
                <div className="flex-1 overflow-y-auto border-r border-sixth dark:border-fourth flex flex-col bg-third">
                    <button onClick={onNew} className="p-2 rounded mx-2.5 my-1 border border-sixth text-fifth dark:text-eighth dark:border-none dark:bg-primary cursor-pointer hover:bg-sixth dark:hover:bg-sixth active:opacity-75">
                        Створити чат
                    </button>
                    {sessions.map(s => (
                        <SidebarItem
                            key={s.id}
                            id={s.id}
                            title={s.title}
                            isActive={s.id === currentSessionId}
                            onSelect={onSelect}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
                <div className="p-4 flex justify-center border-r border-sixth dark:border-fourth bg-third">
                    <ThemeToggle />
                </div>
            </aside>
        </>
    );
}