"use client"

import * as React from "react"
import {
    CalendarIcon,
    EnvelopeClosedIcon,
    FaceIcon,
    GearIcon,
    PersonIcon,
    RocketIcon,
} from "@radix-ui/react-icons" // Checking if these are available, otherwise use lucide-react

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import { useNavigate } from "react-router-dom"
import {
    Calculator,
    CreditCard,
    Settings,
    User,
    LayoutDashboard,
    BarChart3,
    Search,
    Home,
    LogOut
} from "lucide-react"

export function CommandMenu() {
    const [open, setOpen] = React.useState(false)
    const navigate = useNavigate()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                    <CommandItem onSelect={() => runCommand(() => navigate("/stocks"))}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/screener"))}>
                        <Search className="mr-2 h-4 w-4" />
                        <span>Screener</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/analysis"))}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Analysis</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Settings">
                    <CommandItem onSelect={() => runCommand(() => navigate("/profile"))}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                        <CommandShortcut>⌘P</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/portfolio"))}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Portfolio</span>
                        <CommandShortcut>⌘B</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => console.log('Settings clicked'))}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                        <CommandShortcut>⌘S</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
