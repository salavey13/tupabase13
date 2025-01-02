'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { getUsers, User, Event } from '@/lib/database'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface UserSelectorProps {
  onUserSelect: (userId: string | null) => void
  selectedUserId?: string
  selectedEvent?: Event | null
}

export function UserSelector({ onUserSelect, selectedUserId, selectedEvent }: UserSelectorProps) {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true)
      try {
        console.log('Loading users...')
        const fetchedUsers = await getUsers()
        console.log('Fetched users:', fetchedUsers)
        setUsers(fetchedUsers)
      } catch (error) {
        console.error('Error loading users:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadUsers()
  }, [])

  useEffect(() => {
    console.log('Selected user ID:', selectedUserId)
    console.log('Users:', users)
    if (selectedUserId && users.length > 0) {
      const user = users.find(u => u.user_id === selectedUserId)
      console.log('Found user:', user)
      if (user) setSelectedUser(user)
    }
  }, [selectedUserId, users])

  const ticketTiers = selectedEvent?.ticket_tiers || []

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {isLoading ? "Loading..." : (selectedUser ? selectedUser.full_name || selectedUser.username : "Select recipient...")}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search users..." />
          <CommandEmpty>No user found.</CommandEmpty>
          <CommandGroup>
            <CommandItem
              onSelect={() => {
                setSelectedUser(null)
                onUserSelect(null)
                setOpen(false)
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  !selectedUser ? "opacity-100" : "opacity-0"
                )}
              />
              Default Chat ID
            </CommandItem>
            <CommandItem
              onSelect={() => {
                onUserSelect('EVERYONE')
                setOpen(false)
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  selectedUserId === 'EVERYONE' ? "opacity-100" : "opacity-0"
                )}
              />
              EVERYONE
            </CommandItem>
            {Array.isArray(ticketTiers) && ticketTiers.map((tier: any) => (
              <CommandItem
                key={tier.tier}
                onSelect={() => {
                  onUserSelect(`TIER:${tier.tier}`)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedUserId === `TIER:${tier.tier}` ? "opacity-100" : "opacity-0"
                  )}
                />
                {`${tier.tier} ticket holders`}
              </CommandItem>
            ))}
            {users && users.map((user) => (
              <CommandItem
                key={user.user_id}
                onSelect={() => {
                  setSelectedUser(user)
                  onUserSelect(user.user_id)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedUser?.user_id === user.user_id ? "opacity-100" : "opacity-0"
                  )}
                />
                {user.full_name || user.username || user.user_id}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

