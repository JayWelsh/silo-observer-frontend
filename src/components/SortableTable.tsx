import * as React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { visuallyHidden } from '@mui/utils';

import LinkWrapper from './LinkWrapper';
import LoadingIcon from './LoadingIcon';

type Order = 'asc' | 'desc';

function sortData(array: any[], columnConfig: IColumnConfigEntry[], order: 'asc' | 'desc', orderBy: string) {
  let sortedArray = array.sort((a, b) => {
    let sortedColumnConfig = columnConfig.find((item) => item.valueKey === orderBy);
    if(sortedColumnConfig && sortedColumnConfig.numeric) {
      return order === 'desc' ? a[orderBy] - b[orderBy] : b[orderBy] - a[orderBy];
    } else {
      return order === 'desc' ? a[orderBy].localeCompare(b[orderBy]) : b[orderBy].localeCompare(a[orderBy]);
    }
  });
  return sortedArray;
}

interface IColumnConfigEntry {
  id: string
  label: string
  valueKey: string
  numeric: boolean
  disablePadding: boolean
  valueFormatter?: (arg0: any, arg1?: any) => any
  imageGetter?: (arg0: any, arg1?: any) => any
  iconGetter?: (arg0: string, arg1?: any) => JSX.Element | undefined,
  fallbackImage?: string
  internalLinkGetter?: (arg0: any, arg1: any) => string
  externalLinkGetter?: (arg0: any, arg1: any) => string
}

interface EnhancedTableProps {
  columnConfig: IColumnConfigEntry[];
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
  disableSorting?: boolean
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { 
    columnConfig,
    order,
    orderBy,
    onRequestSort,
    disableSorting = false,
  } = props;
  const createSortHandler =
    (property: string) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {columnConfig.map((columnConfigEntry) => (
          <TableCell
            key={columnConfigEntry.id}
            align={'left'}
            padding={columnConfigEntry.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === columnConfigEntry.id ? order : false}
            style={disableSorting ? { pointerEvents: 'none' } : {}}
          >
            <TableSortLabel
              active={orderBy === columnConfigEntry.valueKey}
              direction={orderBy === columnConfigEntry.valueKey ? order : 'asc'}
              onClick={createSortHandler(columnConfigEntry.valueKey)}
              style={{whiteSpace: 'nowrap'}}
            >
              {columnConfigEntry.label}
              {orderBy === columnConfigEntry.valueKey ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

interface EnhancedTableToolbarProps {
  tableHeading: string;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const {
    tableHeading
  } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
      }}
    >
      <Typography
        sx={{ flex: '1 1 100%' }}
        variant="h6"
        id="tableTitle"
        component="div"
      >
        {tableHeading}
      </Typography>
    </Toolbar>
  );
}

interface ISortableTableProps {
  tableHeading: string
  defaultSortValueKey: string
  columnConfig: IColumnConfigEntry[]
  tableData: any[]
  totalRecords?: number
  parentRowsPerPage?: number
  setParentPage?: (arg0: number) => void;
  setParentPerPage?: (arg0: number) => void;
  serverSidePagination?: boolean;
  isLoading?: boolean;
  disableSorting?: boolean;
}

export default function SortableTable(props: ISortableTableProps) {

  let {
    tableHeading,
    defaultSortValueKey,
    columnConfig,
    tableData,
    totalRecords,
    parentRowsPerPage,
    setParentPage,
    setParentPerPage,
    serverSidePagination = false,
    isLoading = false,
    disableSorting = false,
  } = props;
  
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState(defaultSortValueKey);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(parentRowsPerPage ? parentRowsPerPage : 50);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: string,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClick = (event: React.MouseEvent<unknown>, index: number) => {
    console.log({index})
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    if(setParentPage) {
      setParentPage(newPage)
    }
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    if(setParentPage) {
      setParentPage(0)
    }
    if(setParentPerPage) {
      setParentPerPage(parseInt(event.target.value, 10))
    }
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  // const emptyRows =
  //   page > 0 ? Math.max(0, (1 + page) * rowsPerPage - tableData.length) : 0;

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2, border: '1px solid #ffffff3b' }}>
        <EnhancedTableToolbar tableHeading={tableHeading} />
        <TableContainer>
          <Table
            sx={{ minWidth: 750, }}
            aria-labelledby="tableTitle"
            size={'medium'}
          >
            <EnhancedTableHead
              columnConfig={columnConfig}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={tableData.length}
              disableSorting={disableSorting}
            />
            <TableBody sx={{position: 'relative'}}>
              {!isLoading && sortData(tableData, columnConfig, order, orderBy)
                .slice(
                  serverSidePagination ? Math.max((page % (tableData.length / rowsPerPage)) * rowsPerPage, 0)
                    : page * rowsPerPage,
                  serverSidePagination ? Math.min(tableData.length, Math.max((page % (tableData.length / rowsPerPage)) * rowsPerPage, 0) + rowsPerPage)
                    : page * rowsPerPage + rowsPerPage
                )
                .map((row: any, index) => {
                  const labelId = `enhanced-table-checkbox-${index}`;
                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, index)}
                      tabIndex={-1}
                      key={`${row.name}-${row.network}-${row.deploymentID}-${index}`}
                    >
                      {columnConfig.map((columnConfigEntry, index) => {
                        return (
                          <TableCell
                            key={`${labelId}-${index}`}
                            component="th"
                            scope="row"
                            align={index > 0 ? "left" : "left"}
                          >
                            <div style={{display: 'flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                              {columnConfigEntry?.imageGetter && (columnConfigEntry?.imageGetter(row[columnConfigEntry.valueKey], row)?.length > 0) &&
                                <img
                                  loading="lazy"
                                  style={{marginRight: 18, maxHeight: 25, width: 'auto'}}
                                  src={columnConfigEntry?.imageGetter(row[columnConfigEntry.valueKey], row)}
                                  onError={({ currentTarget }) => {
                                    currentTarget.onerror = null; // prevents looping
                                    currentTarget.src="https://vagabond-public-storage.s3.eu-west-2.amazonaws.com/question-mark-white.svg";
                                  }}
                                  alt=""
                                />
                              }
                              {columnConfigEntry?.iconGetter && (columnConfigEntry?.iconGetter(row[columnConfigEntry.valueKey], row)) &&
                                <>
                                  {columnConfigEntry?.iconGetter(row[columnConfigEntry.valueKey], row)}
                                </>
                              }
                              {
                                columnConfigEntry?.internalLinkGetter &&
                                <LinkWrapper decorate={true} className="white-text" link={columnConfigEntry.internalLinkGetter(row[columnConfigEntry.valueKey], row)}>
                                  {columnConfigEntry.valueFormatter
                                    ? columnConfigEntry.valueFormatter(row[columnConfigEntry.valueKey], row) 
                                    : row[columnConfigEntry.valueKey]
                                  }
                                </LinkWrapper>
                              }
                              {
                                columnConfigEntry?.externalLinkGetter &&
                                <LinkWrapper external={true} decorate={true} className="white-text" link={columnConfigEntry.externalLinkGetter(row[columnConfigEntry.valueKey], row)}>
                                  {columnConfigEntry.valueFormatter
                                    ? columnConfigEntry.valueFormatter(row[columnConfigEntry.valueKey], row) 
                                    : row[columnConfigEntry.valueKey]
                                  }
                                </LinkWrapper>
                              }
                              {(!columnConfigEntry?.internalLinkGetter && !columnConfigEntry?.externalLinkGetter) &&
                                <>
                                  {columnConfigEntry.valueFormatter
                                    ? columnConfigEntry.valueFormatter(row[columnConfigEntry.valueKey], row) 
                                    : row[columnConfigEntry.valueKey]
                                  }
                                </>
                              }
                            </div>
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  );
                })}
              {/* {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )} */}
              {isLoading && (
                <TableRow
                  style={{
                    height: 58 * rowsPerPage,
                  }}
                >
                  <TableCell colSpan={columnConfig.length} />
                </TableRow>
              )}
              {isLoading && <LoadingIcon height={100} selfCenter />}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={totalRecords ? totalRecords : tableData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}