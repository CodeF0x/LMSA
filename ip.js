import { networkInterfaces } from 'os';

export function getFirstIPv4() {
    const interfaces = networkInterfaces();

    for (const interfaceName in interfaces) {
        const networkInterface = interfaces[interfaceName];

        for (const address of networkInterface) {
            if (address.family === 'IPv4' && !address.internal) {
                return address.address;
            }
        }
    }

    return null;
}