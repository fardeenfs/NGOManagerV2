import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Input, Table, TableBody, TableCell, TableContainer, TableHeader, TableRow } from '@roketid/windmill-react-ui';
import Layout from 'example/containers/Layout';
import PageTitle from 'example/components/Typography/PageTitle';
import { useAuth } from 'context/AuthContext';
import { useConfig } from 'context/ConfigContext';

type Invoice = {
    receipt_no: string;
    date: Date;
    house_name: string;
    area: string;
    postoffice: string;
    recs: Array<[string, string, number]>;
    total: number;
  };
  
  const ReceiptDetail = () => {
    const { accessToken, loginLoading } = useAuth();
    const { currency, currencySymbol, setCurrency, timezone, setTimezone } = useConfig();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const router = useRouter();
    const receiptId =router.query.receiptNo;

    function formatCurrencyAmount(amount: Number) {
      return Number(amount).toLocaleString('en-IN', {
        style: 'currency',
        currency: currency,});
    }
    
    useEffect(() => {
      
      if(accessToken) {
      const fetchInvoice = async () => {
        
        try {
          const config = {
            method: 'get', // change to the correct HTTP method
            url: process.env.NEXT_PUBLIC_BACKEND_URL+`/api/invoice/?receipt_no=${receiptId}`, // change to the correct endpoint
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              Cookie: 'csrftoken=l24rtPIjD3MYL7l0vxw9FYjO4Ct8M3Mp',
            },
          };
          console.log(config);
          const res = await axios.request(config);
          console.log(res.data);
          setInvoice(res.data.invoice);
        } catch (err) {
          console.log(err);
        }
      };
  
      fetchInvoice();
    }
    if (!loginLoading && !accessToken){
      router.push('/login/');
    }
    }, [receiptId]);
  
    return (
      <>
    {invoice && (
      <div className="p-8 text-gray-500">
        <div className="mt-4 border rounded-md p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">{process.env.NEXT_PUBLIC_APP_NAME}</h2>
            <div>
             <p className="text-xs text-gray-600 dark:text-gray-400">Invoice ID: {invoice.receipt_no}</p>
             <p className="text-xs text-gray-600 dark:text-gray-400">Created: {invoice.date}</p>
            </div>
          </div>
          <div className="mb-8">
            <p className="text-gray-600 dark:text-gray-400"> House : {invoice.house_name}</p>
            <p className="text-gray-600 dark:text-gray-400"> Area : {invoice.area}</p>
            {invoice.postoffice !== 'None' && <p className="text-gray-600 dark:text-gray-400"> Post: {invoice.postoffice}</p>}
          </div>
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Due Type</TableCell>
                  <TableCell>Member Name</TableCell>
                  <TableCell>Amount</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
  {invoice && invoice.recs && invoice.recs.map((rec, index) => (
    <TableRow key={index}>
      <TableCell>{rec[0]}</TableCell>
      <TableCell>{rec[1]}</TableCell>
      <TableCell>{formatCurrencyAmount(rec[2])}</TableCell>
    </TableRow>
  ))}
  {invoice && invoice.total && (
    <TableRow>
      <TableCell></TableCell>
      <TableCell></TableCell>
      <TableCell>
        <b>Total: {formatCurrencyAmount(invoice.total)}</b>
      </TableCell>
    </TableRow>
  )}
</TableBody>
            </Table>
          </TableContainer>
          <Button onClick={() => window.print()} className="mt-8">
            Print Invoice
          </Button>
        </div>
      </div>
    )}
  </>
    )
  };
  
  export default ReceiptDetail;