import {useMemo, useCallback} from 'react';
import PropTypes from 'prop-types';
import {Whether, Else} from 'react-whether';
// import {IconLeft, IconRight} from '@baidu/ee-icon';
import {useDerivedState} from '@huse/derived-state';
import {noop, hasIn, isInteger} from 'lodash';
import classNames from 'classnames';
import Pager from './Pager';
import './Pagination.less';

// 默认显示页码个数
const DEFAULT_PAGE_ITEMS = 10;
const PAGE_BUFFER_SIZE = 4;

const calculatePage = (pageSize, props) => {
    return Math.floor((props.total - 1) / pageSize) + 1;
};

const isValid = (page, current) => isInteger(page) && page !== current;

const getInitPageInfo = props => {
    const hasOnChange = props.onChange !== noop;
    const hasCurrent = hasIn(props, 'current');
    const hasPageSize = hasIn(props, 'pageSize');
    if (hasCurrent && !hasOnChange) {
        // eslint-disable-next-line no-console
        console.warn(
            'Warning: You provided a `current` prop to a Pagination component without an `onChange` handler. '
            + 'This will render a read-only component.'
        );
    }

    let current = props.defaultCurrent;
    if (hasCurrent) {
        // eslint-disable-next-line prefer-destructuring
        current = props.current;
    }

    let pageSize = props.defaultPageSize;
    if (hasPageSize) {
        // eslint-disable-next-line prefer-destructuring
        pageSize = props.pageSize;
    }

    const maxPage = calculatePage(pageSize, props);

    current = Math.min(current, maxPage);

    return {current, pageSize, maxPage};
};

const Pagination = props => {
    const {
        disabled,
        prefixCls,
        className,
        style,
        onChange,
        simple,
    } = props;
    const {current: initCurrent, pageSize, maxPage} = getInitPageInfo(props);
    const [current, setCurrent] = useDerivedState(initCurrent);
    const hasPrev = useMemo(
        () => current > 1,
        [current]
    );
    const hasNext = useMemo(
        () => current < maxPage,
        [current, maxPage]
    );

    const handleChange = useCallback(
        p => {
            let page = p;
            if (isValid(page, current)) {
                if (page > maxPage) {
                    page = maxPage;
                } else if (page < 1) {
                    page = 1;
                }
            }
            setCurrent(page);
            onChange(page, pageSize);
        },
        [current, onChange, pageSize, maxPage, setCurrent]
    );

    const prev = useCallback(
        () => {
            if (hasPrev) {
                handleChange(current - 1);
            }
        },
        [current, handleChange, hasPrev]
    );

    const next = useCallback(
        () => {
            if (hasNext) {
                handleChange(current + 1);
            }
        },
        [current, handleChange, hasNext]
    );

    const pagerList = useMemo(
        () => {
            const list = [];
            if (simple) {
                list.push(
                    <li
                        className={classNames([`${prefixCls}-item`, `${prefixCls}-item-simple`])}
                    >
                        <span>第{current}页</span>
                    </li>
                );
            } else if (maxPage <= DEFAULT_PAGE_ITEMS) {
                if (!maxPage) {
                    list.push(
                        <Pager
                            rootPrefixCls={prefixCls}
                            key="noPager"
                            page={maxPage}
                            disabled
                        />
                    );
                }
                for (let i = 1; i <= maxPage; i++) {
                    const active = i === current;
                    list.push(
                        <Pager
                            rootPrefixCls={prefixCls}
                            key={i}
                            page={i}
                            active={active}
                            onClick={handleChange}
                        />
                    );
                }
            } else {
                let left = Math.max(1, current - PAGE_BUFFER_SIZE - 1);
                let right = Math.min(current + PAGE_BUFFER_SIZE, maxPage);
                if (current - 2 <= PAGE_BUFFER_SIZE) {
                    right = 10;
                }
                if (maxPage - current <= PAGE_BUFFER_SIZE) {
                    left = maxPage - PAGE_BUFFER_SIZE * 2 - 1;
                }

                for (let i = left; i <= right; i++) {
                    const active = i === current;
                    list.push(
                        <Pager
                            rootPrefixCls={prefixCls}
                            key={i}
                            page={i}
                            active={active}
                            onClick={handleChange}
                        />
                    );
                }
            }
            return list;
        },
        [current, maxPage, prefixCls, simple, handleChange]
    );
    const prevDisabled = !hasPrev || !maxPage;
    const nextDisabled = !hasNext || !maxPage;
    return (
        <ul
            className={classNames(prefixCls, className, {
                [`${prefixCls}-disabled`]: disabled,
            })}
            style={style}
            unselectable="unselectable"
        >
            {(current > 1 || simple) && <li
                className={classNames(`${prefixCls}-prev`, {
                    [`${prefixCls}-disabled`]: prevDisabled,
                    [`${prefixCls}-item-simple`]: simple,
                })}
                title="上一页"
                tabIndex={prevDisabled ? null : 0}
                aria-disabled={prevDisabled}
                onClick={prev}
            >
                <a className={classNames(`${prefixCls}-item-link`)}>
                    <Whether matches={simple}>
                        {/* <IconLeft className={classNames(`${prefixCls}-icon`, {
                            [`${prefixCls}-icon-disabled`]: prevDisabled,
                        })}
                        /> */}
                        {'< '}
                        <Else>
                            {'< 上一页'}
                        </Else>
                    </Whether>
                </a>
            </li>}
            {pagerList}
            <li
                className={classNames(`${prefixCls}-next`, {
                    [`${prefixCls}-disabled`]: nextDisabled,
                    [`${prefixCls}-item-simple`]: simple,
                })}
                title="下一页"
                tabIndex={nextDisabled ? null : 0}
                aria-disabled={nextDisabled}
                onClick={next}
            >
                <a className={classNames(`${prefixCls}-item-link`)}>
                    <Whether matches={simple}>
                        {/* <IconRight className={classNames(`${prefixCls}-icon`, {
                            [`${prefixCls}-icon-disabled`]: nextDisabled,
                        })}
                        /> */}
                        {' >'}
                        <Else>
                            {'下一页 >'}
                        </Else>
                    </Whether>
                </a>
            </li>
        </ul>
    );
};

Pagination.propTypes = {
    prefixCls: PropTypes.string,
    defaultCurrent: PropTypes.number,
    total: PropTypes.number,
    defaultPageSize: PropTypes.number,
    onChange: PropTypes.func,
    className: PropTypes.string,
    hideOnSinglePage: PropTypes.bool,
    simple: PropTypes.bool,
    style: PropTypes.object,
};

Pagination.defaultProps = {
    prefixCls: 'pagination',
    defaultCurrent: 1,
    total: 0,
    defaultPageSize: 10,
    onChange: noop,
    className: '',
    hideOnSinglePage: false,
    simple: false,
    style: {},
};

export default Pagination;
