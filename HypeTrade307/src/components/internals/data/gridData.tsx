import Avatar from '@mui/material/Avatar';
import { GridCellParams, GridRowsProp, GridColDef } from '@mui/x-data-grid';

// type SparkLineData = number[];

// function getDaysInMonth(month: number, year: number) {
//   const date = new Date(year, month, 0);
//   const monthName = date.toLocaleDateString('en-US', {
//     month: 'short',
//   });
//   const daysInMonth = date.getDate();
//   const days = [];
//   let i = 1;
//   while (days.length < daysInMonth) {
//     days.push(`${monthName} ${i}`);
//     i += 1;
//   }
//   return days;
// }

// export function renderAvatar(
//   params: GridCellParams<{ name: string; color: string }, any, any>,
// ) {
//   if (params.value == null) {
//     return '';
//   }
//
//   return (
//     <Avatar
//       sx={{
//         backgroundColor: params.value.color,
//         width: '24px',
//         height: '24px',
//         fontSize: '0.85rem',
//       }}
//     >
//       {params.value.name.toUpperCase().substring(0, 1)}
//     </Avatar>
//   );
// }

export const columns: GridColDef[] = [
  { field: 'pageTitle', headerName: 'Stocks', flex: 1.5, minWidth: 200 },
  {
    field: 'content',
    headerName: 'Content',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 240,
  },
  {
    field: 'views',
    headerName: 'Views',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'replies',
    headerName: 'Replies',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 120,
  },
  {
    field: 'dateUpdated',
    headerName: 'Date Updated',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 100,
  },
];

export const rows: GridRowsProp = [
  {
    id: 1,
    pageTitle: 'AAPL - Apple',
    content: 'News: Earnings, Products, etc...',
    views: 60,
    replies: 24,
    dateUpdated: '5/3/2025',
  },
  {
    id: 2,
    pageTitle: 'NVDA - Nvidia',
    content: 'News: Earnings, Products, etc...',
    views: 60,
    replies: 24,
    dateUpdated: '5/3/2025',
  },
  {
    id: 3,
    pageTitle: 'TICKER - Stocks, etc...',
    content: 'News: Earnings, Products, etc...',
    views: 60,
    replies: 24,
    dateUpdated: '5/3/2025',
  },
];
