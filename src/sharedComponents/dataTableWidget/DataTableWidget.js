import React, { useCallback, useEffect, useState } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Table } from '../table';
import { DropDownIcon } from '../dropDowns/dropDownButton';
import Typography from '../typography';
import Brick from '../brick';
import { TimeFrameSelector } from '../timeFrameSelector';
import Pagination from '../pagination/Pagination';
import { DownloadButton } from './components/DownloadButton';

import { Filters } from './components/Filters';
import { DraggableColumns } from './components/DraggableColumns';
import { TableCellCheckBox } from './components/TableComponents/TableCellCheckBox';
import { MenuListPerRow } from './components/TableComponents/MenuListPerRow';

import useDebounce from '../hooks/useDebounce';
import useLocalStorage from '../hooks/useLocalStorage/useLocalStorage';
import { arrayMoveImmutable, getStatesForSelectAllCheckbox } from '../helpers/helper';

import { FILTER_TYPES, LOCAL_STORAGE, SORT_TYPES } from './constants';

import './DataTableWidget.scss';

import { ReactComponent as ArrowSortSVG } from '../assets/icons/arrow-sort.svg';

export const DataTableWidgetContext = React.createContext({});

export const initialFilterState = {
    [FILTER_TYPES.LAST_UPDATED_SELECTOR]: {
        active: 'more-than',
        'within-the-last': {
            value: '0',
            period: 'minutes',
        },
        'more-than': {
            value: '0',
            period: 'minutes ago',
        },
        'date-range': {
            period: { ...TimeFrameSelector.options[0] },
            rangeDate: TimeFrameSelector.options[0].moment(),
        },
    },
    [FILTER_TYPES.RANGE_SELECTOR]: [0, 100],
    [FILTER_TYPES.MULTISELECT]: [],
};

const filterOptions = [
    {
        label: 'Energy Consumption',
        value: 'consumption',
        placeholder: 'All Energy Consumption',
        filterType: FILTER_TYPES.MULTISELECT,
    },
    {
        label: 'Change',
        value: 'change',
        placeholder: 'All Changes',
        filterType: FILTER_TYPES.RANGE_SELECTOR,
    },
    {
        label: 'Square Footage',
        value: 'sq_ft',
        placeholder: 'All Square Footage',
        filterType: FILTER_TYPES.LAST_UPDATED_SELECTOR,
    },
    {
        label: 'Building Type',
        value: 'building_type',
        placeholder: 'All Building Types',
        filterType: FILTER_TYPES.LOCATION_SELECTOR,
    },
];

const DataTableWidget = (props) => {
    const [excludedHeaderLocalStorage, setExcludedHeadersLocalStorage] = useLocalStorage(
        `${LOCAL_STORAGE.EXCLUDED_HEADERS}${props.id && '-' + props.id}`,
        []
    );
    const [orderHeaders, setOrderHeaders] = useLocalStorage(
        `${LOCAL_STORAGE.ORDER_HEADERS}${props.id && '-' + props.id}`,
        []
    );

    const orderedHeaders = [...props.headers].sort(function (a, b) {
        return (
            orderHeaders.findIndex(({ name }) => name === a.name) -
            orderHeaders.findIndex(({ name }) => name === b.name)
        );
    });

    const [headers, setHeaders] = useState(orderedHeaders || props.headers);
    const [excludedHeaders, setExcludedHeaders] = useState(excludedHeaderLocalStorage || []);

    const [rows, setRows] = useState(props.rows);
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchedRows, setSearchedRows] = useState([]);

    const [selectedFilters, setSelectedFilters] = useState([]);
    const [selectedFiltersValues, setSelectedFiltersValues] = useState(_.cloneDeep(initialFilterState));

    const [search, setSearch] = useState('');
    const [searchMode, setSearchMode] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    const onSortEnd = ({ oldIndex, newIndex }) => {
        setHeaders((items) => arrayMoveImmutable(items, oldIndex, newIndex));
    };

    const handleDeleteFilter = ({ value, filterType }) => {
        //reset filter's value to default state
        setSelectedFiltersValues((oldState) => {
            return { ...oldState, [filterType]: initialFilterState[filterType] };
        });

        setSelectedFilters((oldState) => {
            return [...oldState.filter((filter) => filter.value !== value)];
        });
    };

    const handleCheckboxChange = (event, id) => {
        const checked = event.target.checked;
        setSelectedRows((oldState) => {
            return checked ? [...oldState, id] : oldState.filter((item) => item !== id);
        });
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        props.onChangePage(page);
    };

    const handlePageSize = (pageSize) => {
        setPageSize(pageSize);
        props.onPageSize(pageSize);
    };

    const stateSelectAll = getStatesForSelectAllCheckbox(selectedRows, rows);
    const selectAll = {
        onChange: (event) => {
            const checked = event.target.checked;
            setSelectedRows(checked ? _.map(rows, 'id') : []);
            props.onCheckAll && props.onCheckAll(checked);
        },
        defaultChecked: stateSelectAll.checked,
        indeterminate: stateSelectAll.indeterminate,
    };

    const filteredHeaders = headers.filter(({ name }) => !excludedHeaders.includes(name));

    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => {
        const isEmptySearch = _.isEmpty(debouncedSearch);

        setSearchMode(!isEmptySearch);
        props.onSearch && props.onSearch(debouncedSearch);
    }, [debouncedSearch]);

    useEffect(() => {
        setOrderHeaders(headers);
    }, [headers]);

    useEffect(() => {
        setExcludedHeadersLocalStorage(excludedHeaders);
    }, [excludedHeaders]);

    useEffect(() => {
        setSearchedRows(props.searchResultRows);
    }, [props.searchResultRows]);

    useEffect(() => {
        setRows(props.rows);
    }, [props.rows]);

    const cellChildrenTemplate = useCallback((children) => {
        return React.isValidElement(props.customComponentForCells) ? (
            React.cloneElement(props.customComponentForCells, { children, ...props.customComponentForCells.props })
        ) : (
            <Typography.Body size={Typography.Sizes.md}>{children}</Typography.Body>
        );
    }, []);

    const cellCheckboxTemplate = useCallback(
        (rowId) => (
            <TableCellCheckBox
                onChange={(event) => handleCheckboxChange(event, rowId)}
                defaultChecked={selectedRows.includes(rowId)}
            />
        ),
        [selectedRows]
    );

    const currentRows = searchMode ? searchedRows : rows;

    const isActionsAvailable = props.onDeleteRow && props.onEditRow;

    const HeadComponent = ({ onSort, name, accessor }) => {
        const [state, setState] = useState(0);

        const cellProps = {
            onClick: onSort && (() => {
                      setState((prevState) => {
                          if (state === 2) {
                              onSort(SORT_TYPES[0], accessor, name);
                              return 0;
                          }
                          onSort(SORT_TYPES[prevState + 1], accessor, name);
                          return prevState + 1;
                      });
                  }),
            role: onSort && 'button',
            className: cx(
                SORT_TYPES[state],
                SORT_TYPES[state] !== null && 'sort-type-selected',
                onSort && 'on-sort'
            ),
        };

        return (
            <Table.Cell {...cellProps}>
                <div className="d-flex justify-content-between align-items-center">
                    <Typography.Subheader size={Typography.Sizes.sm}>{name}</Typography.Subheader>
                    {onSort && SORT_TYPES[state] && <ArrowSortSVG className={state === 2 && 'rotate-180'} />}
                </div>
            </Table.Cell>
        );
    };

    return (
        <DataTableWidgetContext.Provider
            value={{
                selectedFiltersValues,
                setSelectedFiltersValues,
                excludedHeaders,
                setExcludedHeaders,
                widgetProps: props,
                search,
                setSearch,
            }}>
            <div className="data-table-widget-wrapper">
                <div className="table-filter-widget-wrapper d-flex">
                    <Filters
                        selectedFiltersValues={selectedFiltersValues}
                        onChangeFilterValue={setSelectedFiltersValues}
                        onChange={setSelectedFilters}
                        filterOptions={props.filterOptions}
                        selectedFilters={selectedFilters}
                        onDeleteFilter={handleDeleteFilter}
                    />
                    <div className="ml-auto data-table-widget-action-button-wrapper">
                        <DraggableColumns onSortEnd={onSortEnd} headers={headers} />
                        {props.onDownload && <DownloadButton onClick={props.onDownload} />}
                    </div>
                </div>

                <Brick sizeInRem={1} />

                {!!filteredHeaders.length ? (
                    <Table>
                        <Table.THead>
                            {/*//@ It is probably need to improve custom checkbox to make it generic*/}
                            {props.onCheckAll &&
                                (props.customCheckAll ? (
                                    <Table.Cell>{props.customCheckAll(selectAll)}</Table.Cell>
                                ) : (
                                    <TableCellCheckBox {...selectAll} />
                                ))}

                            {!props.onCheckAll && props.customCheckAll && (
                                <>
                                    <Table.Cell>{props.customCheckAll(selectAll)}</Table.Cell>
                                </>
                            )}

                            {filteredHeaders.map(({ name, onSort, accessor}, index) => (
                                <HeadComponent name={name} onSort={onSort} accessor={accessor} key={index} />
                            ))}

                            {isActionsAvailable && (
                                <Table.Cell>
                                    <Typography.Subheader size={Typography.Sizes.sm}>Actions</Typography.Subheader>
                                </Table.Cell>
                            )}
                        </Table.THead>
                        <Table.TBody>
                            {currentRows.map((row) => (
                                <Table.Row>
                                    {props.onCheckboxRow &&
                                        //@ It is probably need to improve custom checkbox to make it generic
                                        (props.customCheckboxForCell ? (
                                            <Table.Cell width={16}>{props.customCheckboxForCell(row)}</Table.Cell>
                                        ) : (
                                            cellCheckboxTemplate(row.id)
                                        ))}

                                    {!props.onCheckboxRow && props.customCheckboxForCell && (
                                        <Table.Cell width={16}>{props.customCheckboxForCell(row)}</Table.Cell>
                                    )}

                                    {filteredHeaders.map(({ accessor, callbackValue }) => {
                                        return (
                                            <Table.Cell>
                                                {accessor &&
                                                    (callbackValue
                                                        ? callbackValue(row, cellChildrenTemplate)
                                                        : cellChildrenTemplate(row[accessor] || '-'))}

                                                {!accessor && callbackValue && callbackValue(row, cellChildrenTemplate)}
                                            </Table.Cell>
                                        );
                                    })}

                                    {isActionsAvailable && (
                                        <Table.Cell align="center" width={36}>
                                            <div className="d-flex justify-content-center">
                                                <DropDownIcon classNameMenu="data-table-widget-drop-down-button-menu">
                                                    <MenuListPerRow
                                                        onEditRow={(event) =>
                                                            props.onEditRow(event, row.id, row, props)
                                                        }
                                                        onDeleteRow={(event) =>
                                                            props.onDeleteRow(event, row.id, row, props)
                                                        }
                                                    />
                                                </DropDownIcon>
                                            </div>
                                        </Table.Cell>
                                    )}
                                </Table.Row>
                            ))}
                            {currentRows.length === 0 && (
                                <>
                                    <Table.Row>
                                        <Table.Cell colspan={10}>
                                            <Typography.Subheader
                                                className="text-center p-3"
                                                size={Typography.Sizes.md}>
                                                <span className="gray-550">No data.</span>
                                            </Typography.Subheader>
                                        </Table.Cell>
                                    </Table.Row>
                                </>
                            )}
                        </Table.TBody>
                    </Table>
                ) : (
                    <Typography.Subheader size={Typography.Sizes.lg} className="text-center">
                        <span className="gray-800">Select at least one "Header".</span>
                    </Typography.Subheader>
                )}
            </div>
            <Brick sizeInRem={1.25} />
            {props.onPageSize && props.onChangePage && (
                <div className="d-flex justify-content-center">
                    <Pagination
                        className="pagination-bar"
                        currentPage={currentPage}
                        totalCount={props.totalPages}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                        setPageSize={handlePageSize}
                    />
                </div>
            )}
        </DataTableWidgetContext.Provider>
    );
};

DataTableWidget.SortTypes = SORT_TYPES;

DataTableWidget.propTypes = {
    onDownload: PropTypes.func,
    onSearch: PropTypes.func,
    onDeleteRow: PropTypes.func,
    onEditRow: PropTypes.func,
    onChangePage: PropTypes.func.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageSize: PropTypes.func.isRequired,
    //@TODO More generic func, now it is not important
    onStatus: PropTypes.func.isRequired,
    status: PropTypes.number.isRequired,
    rows: PropTypes.array.isRequired,
    searchResultRows: PropTypes.array.isRequired,
    filterOptions: PropTypes.array,
    headers: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            accessor: PropTypes.string.isRequired,
            callbackValue: PropTypes.func,
            onSort: PropTypes.func,
        })
    ),
    onCheckboxRow: PropTypes.func,
    onCheckAll: PropTypes.func,
    id: PropTypes.string,
    buttonGroupFilterOptions: PropTypes.array,
    customComponentForCells: PropTypes.node,
    customCheckboxForCell: PropTypes.node,
    customCheckAll: PropTypes.node,
};

export default DataTableWidget;