import React, { useEffect, useState } from 'react';

import { Button, Input, Label, Select } from '@roketid/windmill-react-ui';
import PageTitle from 'example/components/Typography/PageTitle';
import SectionTitle from 'example/components/Typography/SectionTitle';
import Layout from 'example/containers/Layout';
import axios from 'axios';
import { useAuth } from 'context/AuthContext';
import { useRouter } from 'next/router';

function EditDueForm() {
    const { accessToken, loginLoading } = useAuth();
    const router = useRouter();

    const { dueDisplayId } = router.query;
    
    const [formData, setFormData] = useState({
        due_display_id: '',
        due_type: '',
        due_amount: '',
        due_fineamt: '',
        due_active:'1',
        is_head: '-1',
        is_pension: '-1',
        is_nri: '-1',
        is_govt: '-1',
        is_male: '-1',
        fine_applied:'false',
        paid_together:'false',
        applied:'false',
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
        e.preventDefault(); 
    
        const config = {
            method: 'put',
            url: process.env.NEXT_PUBLIC_BACKEND_URL+`/api/edit-due/`,
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            data: formData
          };
    
        axios.request(config)
            .then((response) => {
                console.log(response.data);
                router.push("/service/dues/config")
                if (response.data.notif) {
                    alert(response.data.notif);
                }
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
        if (dueDisplayId && accessToken) {
          console.log(dueDisplayId);
        const config = {
            method: 'get',
            url: process.env.NEXT_PUBLIC_BACKEND_URL+`/api/edit-due/?due_display_id=${dueDisplayId}`,
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
        }
        console.log(config)

        axios.request(config)
        .then((response) => {
        setDisallowedDueIDs(response.data.dues);
        setAllowedAccountSerials(response.data.accounts)
        setFinancialYear(response.data.financial_year)
        setFormData(response.data.instance)
        console.log(response.data);
        })
        .catch((err) => console.error(err));
    }
    if (!loginLoading && !accessToken){
        router.push('/login/');
      }
    }, [accessToken,dueDisplayId]);
           
  return (
    <Layout>
      <PageTitle>Edit Due</PageTitle>

      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">


          <Label className="mt-4">
            <span>Due ID</span>
            <Input 
                className="mt-1" 
                name="due_id" 
                placeholder="Enter Due ID" 
                value={formData.due_display_id}
                disabled
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
                value={formData.due_amount.toLocaleString()}
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
            <Select className= "mt-1" name="account_serial" value={formData.account_serial} onChange={handleInputChange} disabled>
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
          <SectionTitle>Due Attributes</SectionTitle>

            <Label className="mt-4">
                Is the Due Active?
                <Select className= "mt-1" name="is_active" value={formData.due_active} onChange={handleInputChange}>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                    
                </Select>
            </Label>
            <Label className="mt-4">
                Has The Due Been Applied?
                <Select className= "mt-1" name="due_applied" value={formData.applied} onChange={handleInputChange} disabled>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                    
                </Select>
            </Label>

            <Label className="mt-4">
                Has The Due Been Paid Using The "Mark As Paid" Operation? (Mass Receipt Generation)
                <Select className= "mt-1" name="paid_together" value={formData.paid_together} onChange={handleInputChange} disabled>
                <option value="true">Yes</option>
                    <option value="false">No</option>
                </Select>
            </Label>
            <Label className="mt-4">
                Have Fines Been Applied?
                <Select className= "mt-1" name="fine_applied" value={formData.fine_applied} onChange={handleInputChange} disabled>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                    
                </Select>
            </Label>

            <br/><br/>
          <Button onClick={handleSubmit}>Submit</Button>

      </div>
    </Layout>
  );
}

export default EditDueForm;

