import React, {useEffect, useRef, useState} from "react";
import {
    Form,
    Input,
    Button,
    Table,
    Space,
    Pagination,
    Card,
    Select,
    Row,
    Col,
    Modal, Typography, DatePicker, notification, Tag, Spin, message
} from "antd";
import Title from "antd/es/typography/Title";
import {Br} from "./Br";
import dayjs from "dayjs";
import {CampaignService} from "../services/CampaignService";
import {useParams} from "react-router-dom";
import moment from "moment";
import {DebounceSelect} from "./DebounceSelect";
import {PlusCircleFilled} from "@ant-design/icons";
import {PartyService} from "../services/PartyService";
import {Option} from "antd/es/mentions";
import {DebounceSelectForParty} from "./DebounceSelectForPartyDropdown";
import {CSVLink} from "react-csv";



const SearchForm = ({ onSearch, parties }) => {
    const [searchForm] = Form.useForm();

    const performSearch = () => {
        const formData = searchForm.getFieldsValue();

        ["updatedOn_fld0_value", "updatedOn_fld1_value"].forEach((n, i) => {
            const date = formData[n];
            formData[n] = date ? dayjs(date).format("YYYY-MM-DD HH:mm:ss") : null;

            if (formData[n] === null) {
                delete formData[n];
            }
        });

        const queryData = ["partyId", "terminatingCalledNumber", "campaignName", "packageId", "updatedOn_fld0_value", "updatedOn_fld1_value"].reduce((acc, v) => {
            const field = v;
            const fieldOp = `${field.replace("_value", "")}_op`;
            const fieldValue = (acc[field] || "").trim();

            if (fieldValue === "") {
                delete acc[field];
                delete acc[fieldOp];
            } else {
                acc[field] = fieldValue;
            }

            return acc;
        }, formData);
        onSearch(Object.keys(queryData).length ? queryData : null);
    };

    return (<>
        <Form
            form={searchForm}
            labelCol={{ span: 15}}
            wrapperCol={{span:23}}
            labelAlign="left"
            initialValues={{ updatedOn_fld0_value: moment().subtract(1, 'days'),updatedOn_fld1_value:moment(new Date()) }}
        >
            <Form.Item style={{ display:'inline-block', margin:'0px'}} name="partyId" label="Party Id" children={<DebounceSelectForParty />} />
            <Form.Item name="partyId_op" initialValue={"contains"} hidden  children={  <Select></Select>} />
            <Form.Item style={{ display:'inline-block', margin:'0px'}} name="phoneNumber" label="Phone Number" children={<Input />} />
            <Form.Item name="phoneNumber_op" initialValue={"contains"} hidden children={<Input />} />
            <Form.Item style={{ display:'inline-block', margin:'0px'}} name="campaignName" label="Campaign" children={<Input />} />
            <Form.Item name="campaignName_op" initialValue={"contains"} hidden children={<Input />} />
            {/*<Form.Item style={{ display:'inline-block', margin:'0px'}} name="packageId" label="Package" children={<Input />} />*/}
            {/*<Form.Item name="packageId_op" initialValue={"contains"} hidden children={<Input />} />*/}
            <Form.Item style={{ display:'inline-block', margin:'0px'}} name="updatedOn_fld0_value" label="From Date" children={<DatePicker showTime use12Hours={true} format="YYYY-MM-DD HH:mm:ss" />}/>
            <Form.Item name="updatedOn_fld0_op" initialValue={"greaterThanEqualTo"} hidden children={<Input />} />
            <Form.Item style={{ display:'inline-block', margin:'0px'}} name="updatedOn_fld1_value" label="To Date" children={<DatePicker showTime use12Hours={true} format={"YYYY-MM-DD HH:mm:ss"} />} />
            <Form.Item name="updatedOn_fld1_op" initialValue={"lessThanEqualTo"} hidden children={<Input />} />
            <Form.Item style={{display:'inline-block', margin:'0px'}} wrapperCol={{ offset: 1 }} colon={false} label=' '>
                <Button
                    type="primary"
                    htmlType="submit"
                    onClick={performSearch}
                    children={"Search"}
                />
            </Form.Item>
        </Form>
    </>);
};


function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    var clone = Array.isArray(obj) ? [] : {};

    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            clone[key] = deepClone(obj[key]);
        }
    }

    return clone;
}
function addKeyValueToArrayObjects(arr, key, value) {
    arr.forEach(obj => obj[key] = value);
    return arr;
}
const formatDataAsCSV = (taskReports) => {
    const reversedTaskReports = Object.values(taskReports || {}).reverse();

    const csvData = [];

    csvData.push([
        'title',
        'campaignTaskId',
        'phoneNumber',
        'terminatingCalledNumber',
        'originatingCallingNumber',
        'terminatingCallingNumber',
        'message',
        'smsCount',
        'smsEncoding',
        'campaignId',
        'packageId',
        'routeId',
        'status',
        'statusExternal',
        'statusExternalUpdatedAt',
        'errorCode',
        'errorCodeExternal',
        'taskIdExternal',
        'smsId',
        'retryCount',
        'retryHistory',
        'nextRetryTime',
        'lastRetryTime',
        'allRetryTimes',
        'taskDetailJson',
        'parentId',
        'multipartSegmentNumber',
        'campaignName',
        'senderId',
        'instances',
        'createdStamp',
        'sentOn',
        'lastUpdatedStamp',
    ]);

    function pushTaskRow(task, taskType) {
        csvData.push([
            taskType,
            task.campaignTaskId,
            task.phoneNumber,
            task.terminatingCalledNumber,
            task.originatingCallingNumber,
            task.terminatingCallingNumber,
            task.message,
            task.smsCount,
            task.smsEncoding,
            task.campaignId,
            task.packageId,
            task.routeId,
            task.status,
            task.statusExternal,
            task.statusExternalUpdatedAt,
            task.errorCode,
            task.errorCodeExternal,
            task.taskIdExternal,
            task.smsId,
            task.retryCount,
            task.retryHistory,
            task.nextRetryTime,
            task.lastRetryTime,
            task.allRetryTimes,
            task.taskDetailJson,
            task.parentId,
            task.multipartSegmentNumber,
            task.campaignName,
            task.senderId,
            task.instances,
            task.createdStamp,
            task.sentOn,
            task.lastUpdatedStamp,
        ]);
    }

    reversedTaskReports.forEach(taskGroup => {
        if (taskGroup.length > 1) {
            pushTaskRow(taskGroup[0], "head");
            for (let i = 1; i < taskGroup.length; i++) {
                pushTaskRow(taskGroup[i], "part " + (i+1));
            }
        } else {
            pushTaskRow(taskGroup[0], "head");
        }
    });

    return csvData;
};
const processDataForTableView = ({taskReports}) => {
    const reversedTaskReports = Object.values(taskReports || {}).reverse();
    let index = 0;
    return reversedTaskReports.map((taskGroup, i) => {


        const parentTask = taskGroup[0];
        parentTask.children = taskGroup.slice(1);



        if (parentTask.children.length && (parentTask.statusExternal == "delivered" || parentTask.statusExternal == "processing"|| parentTask.statusExternal == null || parentTask.statusExternal == "pending"))
        {
            const firstNotDelivered = parentTask.children.find(child => child.statusExternal != "delivered");
            if (firstNotDelivered)
            {
                parentTask.errorCodeExternal = parentTask.statusExternal != "delivered" ? parentTask.errorCodeExternal:firstNotDelivered.errorCodeExternal
                parentTask.statusExternal = "failed";
            }
            else
            {

                parentTask.statusExternal = 'delivered';
            }
        }
        else
        {
            parentTask.statusExternal = parentTask.statusExternal == null ? null : (parentTask.errorCodeExternal ? parentTask.statusExternal : "delivered");
        }


        if(parentTask.status == "failed"||parentTask.status == null||parentTask.status == "suspended")
        {
            parentTask.statusExternal = null;
        }

        // console.log(parentTask);

        return parentTask;
    })

}


const DataView = ({ taskReports,spin, viewPage, viewLimit}) => {

    const tableData = processDataForTableView({taskReports});


    const unixToMomentTime=(value)=>{
        if(value==null) return "";
        const parseValue = parseInt(value)*1000;
        // var dateString = moment.unix(+value).format("MM/DD/YYYY");
        const finalTime=  moment(parseValue).format('lll');
        //return dayjs(parseValue).format("MMM D, YYYY - hh:mm A")
        return finalTime;
    }
    const [modalData, setModalData] = useState(null);
    const showModal = data => setModalData(data);
    const handleOk = () => setModalData(null);
    const handleCancel = () => setModalData(null);

    const [modalDataMsg, setModalDataMsg] = useState(null);
    const showModalMsg = data => setModalDataMsg(data);
    const handleOkMsg = () => setModalDataMsg(null);
    const handleCancelMsg = () => setModalDataMsg(null);
    function hasSubTask(task) {
        if(task.instances !=null && task.instances.indexOf(",") >= 0){
            return true;
        } else {
            return false;
        }
    }

    return (<>
        {spin?<Spin spinning={spin} size={"large"}>
            {<Table
            style={{marginLeft:'5px'}}
            size="small"
            // dataSource={taskReports}
            rowKey={parentTask=>parentTask.campaignTaskId}
            dataSource={tableData}
            locale={{ emptyText: taskReports ===null? "E": "NO DATA" }}
            pagination={false}
            scroll={{
                x: 2400,
            }}
            indentSize= '15'
        >
            <Table.Column
                dataIndex={undefined}
                title={"#"}
                width='100px'
                render={(_, __, i) => (viewPage - 1) * viewLimit + (++i)}
            />
            <Table.Column title="Campaign Name" dataIndex={"campaignName"} render={v => v || "N/A"} width={"100pt"}/>
            <Table.Column title="Called Number" dataIndex={"terminatingCalledNumber"} width={"90pt"}/>
            <Table.Column title="Sender Id" dataIndex={"senderId"} width={"110pt"}/>0
            <Table.Column title="Status" dataIndex={"status"} width={"90pt"} render={v => [
                <Tag color={"processing"}>pending</Tag>,
                <Tag color={"success"}>sent</Tag>,
                <Tag color={"warning"}>undetermined</Tag>,
                <Tag color={"error"}>failed</Tag>,
                <Tag color={"error"}>suspended</Tag>][[v === "pending" || v == null, v === "sent", v === "undetermined", v === "failed", v === "suspended"].indexOf(!0)]} />

            <Table.Column title="Status External" dataIndex={"statusExternal"} width={"90pt"} render={(v,row) => [
                <Tag color={"processing"}>pending</Tag>,
                <Tag color={"gold"}>Waiting for status</Tag>,
                <Tag color={"success"}>delivered</Tag>,
                <Tag color={"warning"}>undetermined</Tag>,
                <Tag color={"error"}>failed</Tag>,
                <span></span>,
            ][[v === "pending",v ==="processing", v ==="delivered", v === "undetermined", v === "failed" , !v].indexOf(!0)]} />
            <Table.Column title="Sent On" dataIndex={"sentOn"} width={"170pt"} render={unixToMomentTime} />
            <Table.Column title="Message" width={"150pt"}
                          render={(v, r, i) =>{
                              var msg = r.message;
                              // if (!r.children) { r.children = []; }
                              if(r.children){
                                  r.children.forEach(child => msg+= child.message);
                                  r.children.forEach(child => child.fullMessage = msg);
                              }else{
                                  console.log(r.fullMessage);
                              }

                              v = msg;
                              return  v.length>6?<>
                              <span
                                  style={{textOverflow:"ellipsis",
                                      whiteSpace:"nowrap",
                                      maxWidth: "50pt",
                                      display: "inline-block",
                                      overflow:"hidden",
                                      verticalAlign:"middle"
                                  }}
                              >{v.replace(/\s*,\s*/g, " ")}</span>
                                  <Button type="link" onClick={() => showModalMsg({short: r.message, full: r.fullMessage || v})}>Show all</Button>
                              </>:v}}/>
            {/*//, index: (r.multipartSegmentNumber) + 1, length: r.length*/}
            <Table.Column title="Error" dataIndex={"errorCode"} width={"90pt"} />
            <Table.Column title="Error External" dataIndex={"errorCodeExternal"} width={"90pt"}/>
            <Table.Column title="Package" dataIndex={"packageId"} width={"90pt"}/>
            <Table.Column title="Route" dataIndex={"routeId"} width={"90pt"}/>
            <Table.Column title="Campaign Task Id" dataIndex={"campaignTaskId"} width={"245pt"} />
                <Table.Column title="Retry Count" dataIndex={"retryCount"} width={"170pt"}/>
            <Table.Column title="Next Retry Time" dataIndex={"nextRetryTime"} width={"150pt"} render={(unixToMomentTime)} />
            <Table.Column title="Last Retry Time" dataIndex={"lastRetryTime"} width={"150pt"} render= {(unixToMomentTime)}/>

            <Table.Column
                dataIndex={""}
                render={(_, campaignTask, i) =>
                    <Button onClick={() => showModal(campaignTask)} type="primary" style={{ background:"#1890ff", borderColor:"#1890ff"}}>
                        Schedule
                    </Button>
                }
            />
        </Table>}
        </Spin>:
            <Table
                style={{marginLeft:'5px'}}
                size="small"
                // dataSource={taskReports}
                rowKey={parentTask=>parentTask.campaignTaskId}
                dataSource={tableData}
                locale={{ emptyText: taskReports ===null? "E": "NO DATA" }}
                pagination={false}
                scroll={{
                    x: 2400,
                }}
                indentSize= '15'
            >
                <Table.Column
                    dataIndex={undefined}
                    title={"#"}
                    width='100px'
                    render={(_, __, i) => (viewPage - 1) * viewLimit + (++i)}
                />
                <Table.Column title="Campaign Name" dataIndex={"campaignName"} render={v => v || "N/A"} width={"100pt"}/>
                <Table.Column title="Called Number" dataIndex={"terminatingCalledNumber"} width={"90pt"}/>
                <Table.Column title="Sender Id" dataIndex={"senderId"} width={"110pt"}/>0
                <Table.Column title="Status" dataIndex={"status"} width={"90pt"} render={v => [
                    <Tag color={"processing"}>pending</Tag>,
                    <Tag color={"success"}>sent</Tag>,
                    <Tag color={"warning"}>undetermined</Tag>,
                    <Tag color={"error"}>failed</Tag>,
                    <Tag color={"error"}>suspended</Tag>][[v === "pending" || v == null, v === "sent", v === "undetermined", v === "failed", v === "suspended"].indexOf(!0)]} />

                <Table.Column title="Status External" dataIndex={"statusExternal"} width={"90pt"} render={(v,row) => [
                    <Tag color={"processing"}>pending</Tag>,
                    <Tag color={"gold"}>Waiting for status</Tag>,
                    <Tag color={"success"}>delivered</Tag>,
                    <Tag color={"warning"}>undetermined</Tag>,
                    <Tag color={"error"}>failed</Tag>,
                    <span></span>,
                ][[v === "pending",v ==="processing", v ==="delivered", v === "undetermined", v === "failed" , !v].indexOf(!0)]} />
                <Table.Column title="Sent On" dataIndex={"sentOn"} width={"170pt"} render={unixToMomentTime} />
                <Table.Column title="Message" width={"150pt"}
                              render={(v, r, i) =>{
                                  var msg = r.message;
                                  // if (!r.children) { r.children = []; }
                                  if(r.children){
                                      r.children.forEach(child => msg+= child.message);
                                      r.children.forEach(child => child.fullMessage = msg);
                                  }else{
                                      console.log(r.fullMessage);
                                  }

                                  v = msg;
                                  return  v.length>6?<>
                                  <span
                                      style={{textOverflow:"ellipsis",
                                          whiteSpace:"nowrap",
                                          maxWidth: "50pt",
                                          display: "inline-block",
                                          overflow:"hidden",
                                          verticalAlign:"middle"
                                      }}
                                  >{v.replace(/\s*,\s*/g, " ")}</span>
                                      <Button type="link" onClick={() => showModalMsg({short: r.message, full: r.fullMessage || v})}>Show all</Button>
                                  </>:v}}/>
                {/*//, index: (r.multipartSegmentNumber) + 1, length: r.length*/}
                <Table.Column title="Sent On" dataIndex={"sentOn"} width={"170pt"} render={unixToMomentTime} />
                <Table.Column title="Error" dataIndex={"errorCode"} width={"90pt"} />
                <Table.Column title="Error External" dataIndex={"errorCodeExternal"} width={"90pt"}/>
                <Table.Column title="Package" dataIndex={"packageId"} width={"90pt"}/>
                <Table.Column title="Route" dataIndex={"routeId"} width={"90pt"}/>
                <Table.Column title="Campaign Task Id" dataIndex={"campaignTaskId"} width={"245pt"} />
                <Table.Column title="Retry Count" dataIndex={"retryCount"} width={"170pt"}/>
                <Table.Column title="Next Retry Time" dataIndex={"nextRetryTime"} width={"150pt"} render={(unixToMomentTime)} />
                <Table.Column title="Last Retry Time" dataIndex={"lastRetryTime"} width={"150pt"} render= {(unixToMomentTime)}/>

                <Table.Column
                    dataIndex={""}
                    render={(_, campaignTask, i) =>
                        <Button onClick={() => showModal(campaignTask)} type="primary" style={{ background:"#1890ff", borderColor:"#1890ff"}}>
                            Schedule
                        </Button>
                    }
                />
            </Table>
        }
        <Modal title="Message" key="createCampaign" visible={!!modalDataMsg} onOk={handleOkMsg} onCancel={handleCancelMsg}>
            {/*{modalDataMsg}*/}
            <p><span style={{color:"green"}}>Short Message:</span>  {(modalDataMsg||{}).short}</p>
            <p><span style={{color:"red"}}>Full Message:</span>  {(modalDataMsg||{}).full}</p>
        </Modal>

        <Modal width={1000} visible={modalData !== null} onCancel={handleCancel}
               footer={[<Button style={{backgroundColor: '#FF0000', color: 'white', border: 'none'}} onClick={handleOk}>Close</Button>]} maskClosable={false} closable={false}
        >
            <Table
                dataSource={((modalData || { allRetryTimes: "" }).allRetryTimes || "")
                    .split(",").map((value,index) => (
                        {
                            key: index,
                            date: value,
                            status: 'failed',
                            errorCode: '111',
                        }
                    )) }
                rowKey={"phoneNumber"}
                locale={{ emptyText: taskReports ===null? "E": "NO DATA" }}
                pagination={false}
                style={{padding:15
                }}
            >
                <Table.Column
                    title={"#"}
                    render={(_, __, i) => (viewPage - 1) * viewLimit + (++i)}
                />
                <Table.Column title="Schedule"  dataIndex={"date"} render={(unixToMomentTime)} />
                {/*<Table.Column title="Status"  dataIndex={"status"} render={v => [<Tag color={"processing"}>pending</Tag>, <Tag color={"success"}>Success</Tag>, <Tag color={"error"}>Failed</Tag>][[v === "pending", v === "success", v === "failed"].indexOf(!0)]} />
                <Table.Column title="Error Code"  dataIndex={"errorCode"} />*/}
                {/*<Table.Column title="Retry History" render={<></>} />*/}


            </Table>
        </Modal>
    </>);
};

const DataPager = ({ totalPagingItems, currentPage, onPagingChange }) => {
    return (<>
        <Space align="end" direction="vertical" style={{ width: "100%" }}>
            <Pagination
                total={totalPagingItems}
                defaultPageSize={10}
                pageSizeOptions={["10", "20", "50", "100", "200"]}
                showSizeChanger={true}
                onChange={onPagingChange}
                current={currentPage}
            />
        </Space>
    </>);
};

export const SmsHistory = () => {
    const [parties,setParties] = useState([]);
    const [lastQuery, setLastQuery] = useState({});
    const [taskReports, setTaskReports] = useState([]);
    const [TaskReportsFetchCount, setTaskReportsFetchCount] = useState(0);
    const [taskReportsFetchError, setTaskReportsFetchError] = useState(null);
    const [spin, setSpin] = useState(true);
    const csvData = formatDataAsCSV(taskReports);

    useEffect(()=>{
        PartyService.fetchRecords({})
            .then(data=>{
                console.log(data);
                setParties(data.parties);
            })
            .catch(error=> console.log(error))
    },[])
    useEffect(() => {
        setSpin(true);
        CampaignService.fetchCampaignTaskReports(lastQuery)
            .then(data => {
                setSpin(false);
                console.log(data.taskReports);
                setTaskReports(data.taskReports);
                setTaskReportsFetchCount(data.count);
                setTaskReportsFetchError(null);
            })
            .catch(error => {
                setSpin(false);
                setTaskReports([]);
                setTaskReportsFetchCount(0);
                setTaskReportsFetchError(error);
            });
    }, [lastQuery]);

    useEffect(() => {
        setLastQuery({ page: 1, limit: 10 })
    }, []);


    return (<>
        <Row>
            <Col md={24} style={{marginLeft:'5px',paddingRight:8}}>
                <Card title={<Title level={5}>SMS History</Title>}
                      headStyle={{backgroundColor:"#f0f2f5", border: 0,padding:'0px'}}
                      size="small"
                >
                    <SearchForm parties ={parties} onSearch={data => setLastQuery({ ...(data || {}), page: 1, limit: lastQuery.limit, orderBy: lastQuery.orderBy })}/>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {csvData.length > 0 ?<Button type="primary">
                            <CSVLink
                                filename={"smsHistory.csv"}
                                data={csvData}
                                className="btn btn-primary"
                                onClick={()=>{
                                    message.success("The file is downloading")
                                }}
                            >
                                Export to CSV
                            </CSVLink>
                        </Button>:<Button type="primary" disabled>
                        </Button>}
                    </div>
                </Card>
            </Col>
        </Row>
        <DataView taskReports={taskReports} spin={spin} viewPage={lastQuery.page} viewLimit={lastQuery.limit}/>
        <Br />
        <Space direction='horizontal' style={{ justifyContent: 'flex-end' }}>
            <Button type="primary" onClick={(page, limit) => setLastQuery({...lastQuery, page: lastQuery.page - 1})}>Previous</Button>
            <Button type="primary" onClick={(page, limit) => setLastQuery({...lastQuery, page: lastQuery.page + 1})}>Next</Button>
        </Space>
        {/*<DataPager totalPagingItems={TaskReportsFetchCount} currentPage={lastQuery.page}*/}
        {/*           onPagingChange={(page, limit) => setLastQuery({ ...lastQuery, page, limit })} />*/}
    </>);
};
