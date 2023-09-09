import React, { useEffect, useState } from 'react';

import { Button, Input, Label, Select } from '@roketid/windmill-react-ui';
import PageTitle from 'example/components/Typography/PageTitle';
import SectionTitle from 'example/components/Typography/SectionTitle';
import Layout from 'example/containers/Layout';
import axios from 'axios';
import { useAuth } from 'context/AuthContext';
import { useRouter } from 'next/router';
import { useConfig } from 'context/ConfigContext';
import { route } from 'next/dist/server/router';

function DueForm() {
    const { accessToken, loginLoading } = useAuth();
    const { currency, currencySymbol, setCurrency, timezone, setTimezone } = useConfig();
    const router = useRouter();
    
    function formatCurrencyAmount(amount: Number) {
        return Number(amount).toLocaleString('en-IN', {
          style: 'currency',
          currency: currency,});
      }

    const [formData, setFormData] = useState({
        due_id: '',
        due_type: '',
        due_amount: '',
        due_fineamt: '',
        is_head: '-1',
        is_pension: '-1',
        is_nri: '-1',
        is_govt: '-1',
        is_male: '-1',
        account_serial: 'AC-1'
    });
    
    function handleDueIDBlur(e: React.ChangeEvent<HTMLInputElement>): void {
        const { value } = e.target;
        
        if (disallowedDueIDs.includes(financialYear+'/'+value)) {
            alert('This Due ID is not allowed.');
            setFormData(prevState => ({ ...prevState, due_id: '' }));
        }
    }


    function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    }

    function handleSubmit(e: React.FormEvent): void {
        e.preventDefault(); // prevent default form behavior
    
        if (!accessToken) {
            router.push('/login/');
        }
    

        const config = {
            method: 'post',
            url: process.env.NEXT_PUBLIC_BACKEND_URL+'/api/new-due/',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            data: formData
          };
    
        axios.request(config)
            .then((response) => {
                console.log(response.data);
                if (response.data.notif) {
                    alert(response.data.notif);
                }
                router.push("/service/dues/config/")
            })
            .catch((error) => {
                console.error("Error submitting the form:", error);
                if (error.response && error.response.data.notif) {
                    alert(error.response.data.notif);
                }
            });
    }
    


    const [disallowedDueIDs, setDisallowedDueIDs] = useState<string[]>([]);
    const [allowedAccountSerials, setAllowedAccountSerials] = useState<string[]>([]);
    const [financialYear, setFinancialYear] = useState("")

    

    useEffect(() => {
        if (accessToken) {         
        const config = {
            method: 'get',
            url: process.env.NEXT_PUBLIC_BACKEND_URL+`/api/new-due/`,
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
        }
        axios.request(config)
        .then((response) => {
        setDisallowedDueIDs(response.data.dues);
        setAllowedAccountSerials(response.data.accounts)
        setFinancialYear(response.data.financial_year)
        console.log(response.data);
        })
        .catch((err) => console.error(err));
    }
    if (!loginLoading && !accessToken){
        router.push('/login/');
      }
    }, [accessToken]);
           
  return (
    <Layout>
      <PageTitle>New Due</PageTitle>

      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">


          <Label className="mt-4">
            <span>Due ID</span>
            <Input 
                className="mt-1" 
                name="due_id" 
                placeholder="Enter Due ID" 
                value={formData.due_id}
                onChange={handleInputChange}
                onBlur={handleDueIDBlur}
            />
          </Label>

          <Label className="mt-4">
            <span>Due Type</span>
            <Input 
                className="mt-1" 
                name="due_type" 
                placeholder="Enter Due Type" 
                value={formData.due_type}
                onChange={handleInputChange}
            />
          </Label>

          <Label className="mt-4">
            <span>Due Amount</span>
            <Input 
                className="mt-1" 
                name="due_amount"
                type='number' 
                placeholder="Enter Due Amount" 
                value={formData.due_amount}
                onChange={handleInputChange}
            />
          </Label>

          <Label className="mt-4">
            <span>Due Fine Amount</span>
            <Input 
                className="mt-1" 
                name="due_fineamt" 
                type='number'
                placeholder="Enter Due Fine Amount" 
                value={formData.due_fineamt}
                onChange={handleInputChange}
            />
          </Label>
          <Label className="mt-4">
            <span>Due Account Serial</span>
            <Select className= "mt-1" name="account_serial" value={formData.account_serial} onChange={handleInputChange}>
                {Object.keys(allowedAccountSerials).map((serial, index) => (
                <option key={index} value={serial}>
                    [{serial}] - {allowedAccountSerials[serial][0]} ({allowedAccountSerials[serial][1]})
                </option>
            ))}
            </Select>
          </Label>

            
        <br/><br/>
          <SectionTitle>Application Filters</SectionTitle>

          <Label className="mt-4">
            Apply To Members With Attribute "Head"? 
            <Select className= "mt-1" name="is_head" value={formData.is_head} onChange={handleInputChange}>
                <option value="1">Yes</option>
                <option value="0">No</option>
                <option value="-1">Leave Out This Filter</option>
            </Select>
        </Label>

            <Label className="mt-4">
            Apply To Members With Attribute "Pension"? 
                <Select className= "mt-1" name="is_pension" value={formData.is_pension} onChange={handleInputChange}>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                    <option value="-1">Leave Out This Filter</option>
                </Select>
            </Label>

            <Label className="mt-4">
                Apply To Members With Attribute "NRI (Non Resident Of India)"? 
                <Select className= "mt-1" name="is_nri" value={formData.is_nri} onChange={handleInputChange}>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                    <option value="-1">Leave Out This Filter</option>
                </Select>
            </Label>

            <Label className="mt-4">
                Apply To Members With Attribute "Government Employee (Govt)"? 
                <Select className= "mt-1" name="is_govt" value={formData.is_govt} onChange={handleInputChange}>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                    <option value="-1">Leave Out This Filter</option>
                </Select>
            </Label>

            <Label className="mt-4">
            Apply To Members With Attribute "Male"?
                <Select className= "mt-1" name="is_male" value={formData.is_male} onChange={handleInputChange}>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                    <option value="-1">Leave Out This Filter</option>
                </Select>
            </Label>

            <br/><br/>
          <Button onClick={handleSubmit}>Submit</Button>

      </div>
    </Layout>
  );
}

export default DueForm;

