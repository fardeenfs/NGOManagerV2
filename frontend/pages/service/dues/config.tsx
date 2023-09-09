import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from 'context/AuthContext';
import { useRouter } from 'next/router';
import Layout from 'example/containers/Layout';
import {
  TableBody,
  TableContainer,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  TableFooter,
  Avatar,
  Badge,
  Pagination,
  Input,
  Button,
  ModalBody,
  ModalHeader,
  Modal
} from '@roketid/windmill-react-ui'
import { CardsIcon, ChatIcon, EditIcon, FineIcon, ForbiddenIcon, FormsIcon, HeartIcon, MailIcon, MoneyIcon, OutlineCogIcon, OutlinePersonIcon, PeopleIcon, TickCircleIcon, TrashIcon, UndoCircleIcon, UndoIcon } from 'icons';
import PageTitle from 'example/components/Typography/PageTitle';
import Link from 'next/link';
import SidebarContext from 'context/SidebarContext';
import { useConfig } from 'context/ConfigContext';

type Due = [
  string, string, string, string, 
  number, number, number
];


const DuesConfig = () => {
    const { accessToken, loginLoading } = useAuth();
    const { currency, currencySymbol, setCurrency, timezone, setTimezone } = useConfig();
    const router = useRouter();

    const { isSidebarOpen, closeSidebar } = useContext(SidebarContext);

    const [dues, setDues] = useState([])
    const [manualDueMemberValue, setManualDueMemberValue] = useState('');

    function formatCurrencyAmount(amount: Number) {
        return Number(amount).toLocaleString('en-IN', {
          style: 'currency',
          currency: currency,});
      }

  useEffect(() => {
    if (accessToken) {


    const config = {
      method: 'get',
      url: process.env.NEXT_PUBLIC_BACKEND_URL+`/api/dues-settings/`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    console.log(config);
    axios.request(config)
    .then((response) => {
      console.log(response.data);
      setDues(response.data.dues);
        
    })
    .catch((err) => console.error(err));
}
    if (!loginLoading && !accessToken){
        router.push('/login/');
      }
  }, [accessToken]);
  
    
    function handleEditDue(arg0: never): void {
        throw new Error('Function not implemented.');
    }

    function handleApplyAll(arg0: any): void {
        const config = {
            method: 'post',
            url: process.env.NEXT_PUBLIC_BACKEND_URL+'/api/apply-due/',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            data:{'due_display_id':arg0}
            };
        axios.request(config)
        .then((response) => {
            console.log(response.data);
            router.reload()
        })
        .catch((err) => {
            console.log(err);
        })
    }

    function handleApplyToMember(arg0: any,arg1: any): void {
        const config = {
            method: 'post',
            url: process.env.NEXT_PUBLIC_BACKEND_URL+'/api/apply-due-manual/',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            data:{'due_display_id':arg0,'member_no':arg1}
            };
        axios.request(config)
        .then((response) => {
            console.log(response.data);
            window.alert("Done")
        })
        .catch((err) => {
            console.log(err);
        })
    }

    function handleOverride(arg0: any): void {
        const config = {
            method: 'post',
            url: process.env.NEXT_PUBLIC_BACKEND_URL+'/api/override-due/',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            data:{'due_display_id':arg0}
            };
        axios.request(config)
        .then((response) => {
            console.log(response.data);
            router.reload()
        })
        .catch((err) => {
            console.log(err);
        })
    }

    function handleMarkAsPaid(arg0: any): void {
        const config = {
            method: 'post',
            url: process.env.NEXT_PUBLIC_BACKEND_URL+'/api/mark-as-paid/',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            data:{'due_display_id':arg0}
            };
        axios.request(config)
        .then((response) => {
            console.log(response.data);
            router.reload()
        })
        .catch((err) => {
            console.log(err);
        })
    }

    function handleUndoPayment(arg0: any): void {
        const config = {
            method: 'post',
            url: process.env.NEXT_PUBLIC_BACKEND_URL+'/api/undo-mark-as-paid/',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            data:{'due_display_id':arg0}
            };
        axios.request(config)
        .then((response) => {
            console.log(response.data);
            router.reload()
        })
        .catch((err) => {
            console.log(err);
        })
    }

    function handleApplyFine(arg0: never): void {
        const config = {
            method: 'post',
            url: process.env.NEXT_PUBLIC_BACKEND_URL+'/api/apply-due-fine/',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            data:{'due_display_id':arg0}
            };
        axios.request(config)
        .then((response) => {
            console.log(response.data);
            router.reload()
        })
        .catch((err) => {
            console.log(err);
        })
    }

  return (
    <Layout>
        <PageTitle>Dues Configuration</PageTitle>
        <div className="flex flex-col flex-wrap mb-8 space-y-4 md:flex-row md:items-end md:space-x-4">
        <Button iconRight={EditIcon} onClick={()=>router.push("/service/dues/new/")}>New Due</Button>
        </div>
        <TableContainer>
      <Table>
        <TableHeader>
            <TableCell style={{ width: "100px", textAlign: "left" }}>Due ID</TableCell>
            <TableCell style={{ textAlign: "left" }}>Due Type</TableCell>
            <TableCell style={{ width: "120px", textAlign: "right" }}>Due Amount</TableCell>
            <TableCell style={{ width: "70px", textAlign: "right" }}>Fine</TableCell>
            <TableCell style={{ textAlign: "center" }}>Edit</TableCell>
            <TableCell style={{ textAlign: "center" }}>Apply All</TableCell>
            <TableCell style={{ textAlign: "center" }}>Apply To Member</TableCell>
            <TableCell style={{ textAlign: "center" }}>Override</TableCell>
            <TableCell style={{ textAlign: "center" }}>Mark As Paid</TableCell>
            <TableCell style={{ textAlign: "center" }}>Apply Fine</TableCell>
        </TableHeader>

        
        <TableBody>
            
          {dues.map((due, index) => (
            <TableRow key={index}>
              <TableCell style={{ textAlign: "left" }}>
              <div className="text-base font-sans">
                {due[0]}
                </div>
                </TableCell>
              <TableCell style={{ textAlign: "left" }}>
              <div className="text-base font-sans">
           
                {due[1]}
              
                </div>
                </TableCell>
              <TableCell style={{ textAlign: "right" }}>
              <div className="text-base font-sans">
                {formatCurrencyAmount(due[2])}
                </div>
                </TableCell>
              <TableCell style={{ textAlign: "right" }}>
              <div className="text-base font-sans">
                {formatCurrencyAmount(due[3])}
                </div></TableCell>
              <TableCell>
                 {/* For the Edit Due button */}
              <Button onClick={() => router.push(`/service/dues/edit/${encodeURIComponent(due[0])}`)} size="small" aria-label="Edit Due" title="Edit Due" >
                <EditIcon className="w-5 h-5" aria-hidden="true" />
              </Button>
                   
                </TableCell>
                <TableCell style={{ textAlign: "center" }}>
                    {/* For the Apply All logic */}
                {due[4] === 0|| due[4] === false ? 
                    <Button onClick={() => handleApplyAll(due[0])}  size="small" aria-label="Apply All" title="Apply All">
                        <PeopleIcon className="w-5 h-5" aria-hidden="true" />
                    </Button> :
                    <Button layout="link" size="small" aria-label="Disbled" title="Already Applied">
                        <TickCircleIcon className="w-5 h-5" aria-hidden="true" />
                    </Button>
                }

                    
                </TableCell>
                <TableCell style={{ display: 'flex', justifyContent: "center", alignItems: "center" }}>
                    {/* For the Apply To Member form */}
                    <Input 
                        style={{ width: '50px' }} 
                        type="text" 
                        required 
                        value={manualDueMemberValue}
                        onChange={(e) => setManualDueMemberValue(e.target.value)}/>
                        <p>&nbsp;&nbsp;</p>
                    <Button onClick={() => handleApplyToMember(due[0],manualDueMemberValue)} size="small" aria-label="Apply To Member" title="Apply To Member">
                        <OutlinePersonIcon className="w-5 h-5" aria-hidden="true" />
                    </Button>
                </TableCell>

                <TableCell style={{ textAlign: "center" }}>
                    {/* For the Override logic */}
                    {(due[4] === 1 || due[4] == true)? 
                    <Button onClick={() => handleOverride(due[0])} size="small" aria-label="Override Due" title="Override Due">
                        <UndoCircleIcon className="w-5 h-5" aria-hidden="true" />
                    </Button> :
                    <Button layout="link" size="small" aria-label="Not Applied" title="Not Applied">
                        <ForbiddenIcon className="w-5 h-5" aria-hidden="true" />
                    </Button>
                }
                </TableCell>
                <TableCell style={{ textAlign: "center" }}>
                    {/* For the Mark As Paid logic */}
                    {(due[4] === 1 || due[4] === true)&& (due[5] === 0 || due[5] === false)? 
                    <Button onClick={() => handleMarkAsPaid(due[0])} size="small" aria-label="Mark As Paid" title="Mark As Paid">
                        <TickCircleIcon className="w-5 h-5" aria-hidden="true" /></Button> : 
                    (due[5] === 1 || due[5] === true) ?

                    <Button onClick={() => handleUndoPayment(due[0])} size="small" aria-label="Undo Payment" title="Undo Payment">
                        <UndoIcon className="w-5 h-5" aria-hidden="true" />
                    </Button> :
                    <Button layout="link" size="small" aria-label="Not Applied" title="Not Applied">
                    <ForbiddenIcon className="w-5 h-5" aria-hidden="true" />
                    </Button>
                  
                }

                </TableCell>
                <TableCell style={{ textAlign: "center" }}>
                    {/* For the Apply Fine logic */}
                    {(due[4] === 0 || due[4] === false)? 
                    <Button layout="link" size="small" aria-label="Not Applied" title="Not Applied">
                          <ForbiddenIcon className="w-5 h-5" aria-hidden="true" />
                    </Button>:
                    (due[6] === 0 || due[6] === false) ?  
                    <Button onClick={() => handleApplyFine(due[0])} size="small" aria-label="Apply Fine" title="Apply Fine">
                         <FineIcon className="w-5 h-5" aria-hidden="true" />
                    </Button> :
                    <Button layout="link" size="small" aria-label="Disbled" title="Already Applied">
                    <TickCircleIcon className="w-5 h-5" aria-hidden="true" />
                </Button>                    
                    
          
                }
            </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      </TableContainer>
    </Layout>
  );
}

export default DuesConfig;