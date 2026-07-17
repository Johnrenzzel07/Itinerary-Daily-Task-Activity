"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StatusItem } from "@/types";

interface SearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  statusId: string;
  onStatusChange: (value: string) => void;
  statuses: StatusItem[];
}

export function SearchBar({
  search,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  statusId,
  onStatusChange,
  statuses,
}: SearchBarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40 dark:text-white/40" />
        <Input
          placeholder="Search activity, status, remarks..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
            onClick={() => onSearchChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Select value={dateRange} onValueChange={onDateRangeChange}>
        <SelectTrigger className="w-full lg:w-[160px]">
          <SelectValue placeholder="Date range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="yesterday">Yesterday</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
        </SelectContent>
      </Select>

      <Select value={statusId || "all"} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full lg:w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status.id} value={status.id}>
              {status.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
