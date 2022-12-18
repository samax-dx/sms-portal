import React, {useRef} from 'react';
import {Form, Select, Spin} from 'antd';
import {PartyService} from "../services/PartyService";
import {CurrencyService} from "../services/CurrencyService";
import {Option} from "antd/es/mentions";


const debounce = (cb, timeout = 300, _idle = true, _args) => (...args) => {
    if (_idle) {
        setTimeout(() => {
            cb(..._args);
            _idle = true;
        }, timeout);

        _idle = false;
    }

    _args = [...args];
};

export const DebounceCurrency = ({ query, debounceTimeout = 500, ...props }) => {
    const fetchOptions = () => CurrencyService.fetchRecords({})
        .then(data =>
            data.currency.map((user) => ({
                label: `${user.name} - ${user.code} - ${user.symbol}`,
                value: user.code,
            })),
        );
    const [fetching, setFetching] = React.useState(false);
    const [options, setOptions] = React.useState([]);
    const fetchRef = React.useRef(0);
    const ref = useRef();
    const debounceFetcher = React.useMemo(() => {
        const loadOptions = (value) => {
            fetchRef.current += 1;
            const fetchId = fetchRef.current;
            setOptions("");
            setFetching(true);
            fetchOptions(value).then((newOptions) => {
                if (fetchId !== fetchRef.current) {
                    // for fetch callback order
                    return;
                }

                setOptions(newOptions);
                setFetching(false);
            });
        };

        return debounce(loadOptions, debounceTimeout);
    }, [fetchOptions, debounceTimeout]);
    return (
        <Form.Item name="currencyCode" rules={[{ required: false }]} >
        <Select
            ref={ref}
            mode="multiple"
            filterOption={false}
            onSearch={debounceFetcher}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            {...props}
            options={options}
            onChange={() => ref.current.blur()}
        />
        </Form.Item>
    );
}