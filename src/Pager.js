import {useCallback} from 'react';
import classNames from 'classnames';

const Pager = ({rootPrefixCls, className, page, active, onClick}) => {
    const prefixCls = `${rootPrefixCls}-item`;
    const cls = classNames(prefixCls, {
        [`${prefixCls}-active`]: active,
        [className]: !!className,
        [`${rootPrefixCls}-disabled`]: !page,
    });

    const handleClick = useCallback(
        () => onClick(page),
        [page, onClick]
    );

    return (
        <li
            className={cls}
            title={page}
            onClick={handleClick}
            tabIndex="0"
        >
            <a rel="nofollow">{page}</a>
        </li>
    );
};

export default Pager;
