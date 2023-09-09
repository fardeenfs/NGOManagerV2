import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Input, Table, TableBody, TableCell, TableContainer, TableFooter, TableHeader, TableRow } from '@roketid/windmill-react-ui';
import Layout from 'example/containers/Layout';
import Link from 'next/link'
import { useAuth } from 'context/AuthContext';
import { useConfig } from 'context/ConfigContext';


const FamilyDetail = () => {
  const { accessToken, loginLoading } = useAuth();
  const { currency, currencySymbol, setCurrency, timezone, setTimezone } = useConfig();
  const router = useRouter();

  function formatCurrencyAmount(amount: Number) {
    return Number(amount).toLocaleString('en-IN', {
      style: 'currency',
      currency: currency,});
  }

  const { familyNo } = router.query;

  const [data, setData] = useState<{[key: string]: any} | null>(null);

  const [totalInvoice, setTotalInvoice] = useState(0);
  const [dueAmounts, setDueAmounts] = useState<number[]>([]);



const [formInputs, setFormInputs] = useState<any[]>([]);

const handleAmountEntry = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
  // Rest of your code here...
    const newDueAmounts = [...dueAmounts];
    newDueAmounts[index] = Number(e.target.value);
    setDueAmounts(newDueAmounts);
    setTotalInvoice(newDueAmounts.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0));

  // Copy and update the form inputs
  const newFormInputs = [...formInputs];
  newFormInputs[index] = {
    'due-id': data?.dues[index][2],
    'member-id': data?.dues[index][0],
    'family-id': data?.duefamily[0],
    'amount': Number(e.target.value),
  };
  setFormInputs(newFormInputs);
};

const handlePayClick = async () => {
  const nonZeroInputs = formInputs.filter(input => input.amount !== 0);
  const config = {
    method: 'post', // change to the correct HTTP method
    url: process.env.NEXT_PUBLIC_BACKEND_URL+`/api/dues/?family-dues=${familyNo}`, // change to the correct endpoint
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data: {pay_list: JSON.stringify(nonZeroInputs),  btn:'submit-payment'},
  };
  console.log(config);
  try {
    const response = await axios.request(config);
    console.log(response.data);
  } catch (err) {
    console.error(err);
  }
  router.reload();
};


const handleOverrideClick = async () => {
  const nonZeroInputs = formInputs.filter(input => input.amount !== 0);
  const config = {
    method: 'post', // change to the correct HTTP method
    url: process.env.NEXT_PUBLIC_BACKEND_URL+`/api/dues/?family-dues=${familyNo}`, // change to the correct endpoint
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data: {pay_list: JSON.stringify(nonZeroInputs)},
  };
  console.log(config);
  try {
    const response = await axios.request(config);
    console.log(response.data);
  } catch (err) {
    console.error(err);
  }
  router.reload();  
};

const cancelReceipt = async (receiptNo: any, familyNo: string | string[] | undefined) => {
  const config = {
    method: 'post',
    url: process.env.NEXT_PUBLIC_BACKEND_URL+`/api/cancel-receipt/`, // replace with the correct endpoint
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data: {
      'Receipt No.': receiptNo,
      'Family No.': familyNo,
    },
  };

  try {
    const response = await axios.request(config);
    console.log(response.data);
    router.reload();
  } catch (err) {
    console.error(err);
  }
};

function formatDate(dateString) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString(undefined, options);
  return formattedDate.split('/').join('-');
}

useEffect(() => {
  if (data && data.dues) {
    setFormInputs(data?.dues.map((due: any[]) => ({
      'due-id': due[2],
      'member-id': due[0],
      'family-id': familyNo,
      'amount': 0, // Initialize with 0, user will update this value
    })));
  }
}, [data]);


  useEffect(() => {
    if (familyNo && accessToken) {
      const config = {
        method: 'get',
        url: process.env.NEXT_PUBLIC_BACKEND_URL+`/api/dues/?family-dues=${familyNo}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      };

      axios.request(config)
        .then((response) => {
          setData(response.data);
          console.log(response.data);
    })
        .catch((err) => console.error(err));
    }
    if (!loginLoading && !accessToken){
      router.push('/login/');
    }
  }, [familyNo]);


  return (
    <Layout>
        <div className="flex flex-col space-y-2">
        <h3 style={{ padding: '10px', color: 'violet' }}>Family Information</h3>
      <div id="family-section" className='flex'> 
      
        <TableContainer>
          <Table>
          <TableHeader>
                <TableCell style={{textAlign:'right'}}>Family Number</TableCell>
                <TableCell style={{textAlign:'left'}}>Family Name</TableCell>
                <TableCell style={{textAlign:'right'}}>Census Number</TableCell>
                <TableCell style={{textAlign:'left'}}>Area/Ward</TableCell>
                <TableCell style={{textAlign:'left'}}>P.O. Box</TableCell>
                <TableCell style={{textAlign:'left'}}>Members</TableCell>
            </TableHeader>
          {data && (
            

            <TableBody>

                <TableRow>

                  <TableCell style={{textAlign:'right'}}><p className="text-gray-600 dark:text-gray-400">{data.duefamily[0]}</p></TableCell>

                  <TableCell  style={{textAlign:'left'}}><p className="text-gray-600 dark:text-gray-400">{data.duefamily[1]}</p></TableCell>
                    <TableCell style={{textAlign:'right'}}><p className="text-gray-600 dark:text-gray-400">{data.duefamily[2]}</p></TableCell>
  
                    <TableCell style={{textAlign:'left'}}><p className="text-gray-600 dark:text-gray-400">{data.duefamily[3]}</p></TableCell>
                    <TableCell style={{textAlign:'left'}}><p className="text-gray-600 dark:text-gray-400">{data.duefamily[4]}</p></TableCell>

                    <TableCell style={{textAlign:'left'}}>{data.members[Object.keys(data.members)[0]].map((due: any, index: any) => (
                      <p className="text-gray-600 dark:text-gray-400">{due[0]} ({due[1]})</p>
                    ))}</TableCell>
                  </TableRow>
            </TableBody>
            )}
          </Table>
        </TableContainer>
      </div>
      <div id="dues-section">
        <h3 style={{ padding: '10px', color: 'violet' }}>Dues</h3>
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>JP No.</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Due Type</TableCell>
                <TableCell style={{ textAlign: 'right'}}>Due Amount</TableCell>
                <TableCell style={{ textAlign: 'right'}}>Balance</TableCell>
                <TableCell colSpan={3}>Amount</TableCell>
                <TableCell colSpan={2}>Actions</TableCell>

              </TableRow>
            </TableHeader>
            <TableBody>
              {data && data.dues.map((due: any, index: any) => (
                <TableRow key={index} className={due[6] === 0 ? "text-red-500" : ""}>
                  <TableCell>{due[0]}</TableCell>
                  <TableCell>{due[1]}</TableCell>
                  <TableCell>{due[3]}</TableCell>
                  <TableCell style={{ textAlign: 'right'}}>{formatCurrencyAmount(due[4])}</TableCell>
                  <TableCell style={{ textAlign: 'right'}} >{formatCurrencyAmount(due[5])}</TableCell>
                  <TableCell colSpan={3} style={{ textAlign: 'right' }}>
                    <Input
                    name='amount'
                    className='mt-1'
                    type='number'
                    placeholder='Enter amount'
                    onChange={handleAmountEntry(index)
                    }
                />
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} style={{ textAlign: 'right' }}></TableCell>
                <TableCell colSpan={4} style={{ textAlign: 'right' }}>Total  {formatCurrencyAmount(totalInvoice)}</TableCell>
                <TableCell><Button onClick={handlePayClick}> Pay</Button></TableCell>
                <TableCell><Button onClick={handleOverrideClick}> Override</Button></TableCell>
              </TableRow>


                </TableBody>
            </Table>
        </TableContainer>

      </div>
    
      <div id="receipt-section">
    <h3 style={{ padding: '10px', color: 'violet' }}>Receipts</h3>
    <TableContainer>
        <Table style={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHeader>
                <TableRow>
                    <TableCell style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Receipt No.</TableCell>
                    <TableCell style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Member(s)</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Receipt Date</TableCell>
                    <TableCell >Print</TableCell>
                    <TableCell>Cancel</TableCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data && data.familyreceipts.map((receipt: any, index: any) => (
                    <TableRow key={index}>
                        <TableCell style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{receipt[0]}</TableCell>
                        <TableCell style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{receipt[3]}</TableCell>
                        <TableCell>{formatCurrencyAmount(receipt[2])}</TableCell>
                        <TableCell title={receipt[1]}>{formatDate(receipt[1])}</TableCell>
                        <TableCell>
                            <Button><Link href={`/service/receipt/${encodeURIComponent(receipt[0])}`}><a>Print</a></Link></Button>
                        </TableCell>
                        <TableCell>
                          <Button onClick={() => cancelReceipt(receipt[0], familyNo)}>Cancel</Button>
                        </TableCell>

                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
</div>
      <br></br>
    </div>
    </Layout>
  );
};

export default FamilyDetail;

