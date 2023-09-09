import { Label, Select } from '@roketid/windmill-react-ui';
import { useAuth } from 'context/AuthContext';
import { useConfig } from 'context/ConfigContext';
import PageTitle from 'example/components/Typography/PageTitle';
import Layout from 'example/containers/Layout';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

function SettingsPage() {
    const { accessToken, loginLoading } = useAuth();
    const { currency, currencySymbol, setCurrency, timezone, setTimezone } = useConfig();
    const router = useRouter();

    useEffect(() => {
    if (!loginLoading && !accessToken) {
        router.push('/login/');
      }
    }, [accessToken]);

    return (
        <Layout>
            <PageTitle>Settings</PageTitle>

            <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
                <Label className="mt-4">Currency</Label>
                <Select value={currency} onChange={e => setCurrency(e.target.value)} disabled>
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                </Select>

                <Label className="mt-4">Timezone</Label>
                <Select value={timezone} onChange={e => setTimezone(e.target.value)} disabled>
                    <option value="IST">IST</option>
                    <option value="UTC">UTC</option>
                    <option value="GMT">GMT</option>
                    
                </Select>
            </div>
        </Layout>
    );
}

export default SettingsPage;
