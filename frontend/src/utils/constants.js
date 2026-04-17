export const ROLES = { USER: 'USER', ADMIN: 'ADMIN', TECHNICIAN: 'TECHNICIAN' };

export const BOOKING_STATUS = { PENDING: 'PENDING', APPROVED: 'APPROVED', REJECTED: 'REJECTED', CANCELLED: 'CANCELLED' };

export const TICKET_STATUS = { OPEN: 'OPEN', IN_PROGRESS: 'IN_PROGRESS', RESOLVED: 'RESOLVED', CLOSED: 'CLOSED', REJECTED: 'REJECTED' };

export const RESOURCE_TYPES = [
  'LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'AUDITORIUM',
  'SPORTS_FACILITY', 'LIBRARY_ROOM', 'EQUIPMENT'
];

export const TICKET_CATEGORIES = [
  'ELECTRICAL', 'PLUMBING', 'HVAC', 'STRUCTURAL',
  'IT_EQUIPMENT', 'FURNITURE', 'CLEANING', 'OTHER'
];

export const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  ACTIVE: 'bg-green-500 text-white',
  OUT_OF_SERVICE: 'bg-red-500 text-white',
};

export const PRIORITY_COLORS = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};