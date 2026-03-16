import { FormEvent, useState } from 'react';

import { apiClient, AddressTransfersResponse, BlockResponse, TransactionResponse } from './api/client';

function App() {
  const [address, setAddress] = useState('');
  const [addressData, setAddressData] = useState<AddressTransfersResponse | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  const [txHash, setTxHash] = useState('');
  const [txData, setTxData] = useState<TransactionResponse | null>(null);
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  const [blockNumber, setBlockNumber] = useState('');
  const [blockData, setBlockData] = useState<BlockResponse | null>(null);
  const [blockLoading, setBlockLoading] = useState(false);
  const [blockError, setBlockError] = useState<string | null>(null);

  const onSearchAddress = async (e: FormEvent) => {
    e.preventDefault();
    setAddressLoading(true);
    setAddressError(null);
    setAddressData(null);

    try {
      const data = await apiClient.getAddressTransfers(address.trim(), 20, 0);
      setAddressData(data);
    } catch (error) {
      setAddressError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setAddressLoading(false);
    }
  };

  const onSearchTx = async (e: FormEvent) => {
    e.preventDefault();
    setTxLoading(true);
    setTxError(null);
    setTxData(null);

    try {
      const data = await apiClient.getTransaction(txHash.trim());
      setTxData(data);
    } catch (error) {
      setTxError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setTxLoading(false);
    }
  };

  const onSearchBlock = async (e: FormEvent) => {
    e.preventDefault();
    setBlockLoading(true);
    setBlockError(null);
    setBlockData(null);

    try {
      const data = await apiClient.getBlock(blockNumber.trim());
      setBlockData(data);
    } catch (error) {
      setBlockError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setBlockLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="header">
        <h1>Ethereum Indexer Explorer</h1>
        <p>Query indexed block, transaction, and ERC20 transfer data.</p>
      </header>

      <section className="card">
        <h2>Search Address Transfers</h2>
        <form className="query-form" onSubmit={onSearchAddress}>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            aria-label="address"
          />
          <button type="submit" disabled={addressLoading || !address.trim()}>
            {addressLoading ? 'Loading...' : 'Search'}
          </button>
        </form>

        {addressError && <p className="error">Error: {addressError}</p>}
        {!addressError && !addressLoading && addressData && addressData.items.length === 0 && (
          <p className="empty">No transfers found.</p>
        )}
        {!addressError && !addressLoading && addressData && addressData.items.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Block</th>
                  <th>Tx Hash</th>
                  <th>Token</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {addressData.items.map((item) => (
                  <tr key={`${item.txHash}-${item.logIndex}`}>
                    <td>{item.blockNumber}</td>
                    <td className="mono">{item.txHash}</td>
                    <td className="mono">{item.tokenAddress}</td>
                    <td className="mono">{item.fromAddress}</td>
                    <td className="mono">{item.toAddress}</td>
                    <td className="mono">{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <h2>Search Transaction</h2>
        <form className="query-form" onSubmit={onSearchTx}>
          <input
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            placeholder="0x..."
            aria-label="tx hash"
          />
          <button type="submit" disabled={txLoading || !txHash.trim()}>
            {txLoading ? 'Loading...' : 'Search'}
          </button>
        </form>

        {txError && <p className="error">Error: {txError}</p>}
        {!txError && !txLoading && txData && (
          <div className="details">
            <p><strong>Hash:</strong> <span className="mono">{txData.transaction.hash}</span></p>
            <p><strong>Block:</strong> {txData.transaction.blockNumber}</p>
            <p><strong>From:</strong> <span className="mono">{txData.transaction.fromAddress}</span></p>
            <p><strong>To:</strong> <span className="mono">{txData.transaction.toAddress ?? 'null'}</span></p>
            <p><strong>Value:</strong> <span className="mono">{txData.transaction.value}</span></p>
            <p><strong>Gas:</strong> <span className="mono">{txData.transaction.gas}</span></p>
            <p><strong>Status:</strong> {String(txData.transaction.status)}</p>

            <h3>Transfers</h3>
            {txData.transfers.length === 0 ? (
              <p className="empty">No transfer logs in this transaction.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>LogIndex</th>
                      <th>Token</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txData.transfers.map((item) => (
                      <tr key={`${item.txHash}-${item.logIndex}`}>
                        <td>{item.logIndex}</td>
                        <td className="mono">{item.tokenAddress}</td>
                        <td className="mono">{item.fromAddress}</td>
                        <td className="mono">{item.toAddress}</td>
                        <td className="mono">{item.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="card">
        <h2>Search Block</h2>
        <form className="query-form" onSubmit={onSearchBlock}>
          <input
            value={blockNumber}
            onChange={(e) => setBlockNumber(e.target.value)}
            placeholder="e.g. 10450284"
            aria-label="block number"
          />
          <button type="submit" disabled={blockLoading || !blockNumber.trim()}>
            {blockLoading ? 'Loading...' : 'Search'}
          </button>
        </form>

        {blockError && <p className="error">Error: {blockError}</p>}
        {!blockError && !blockLoading && blockData && (
          <div className="details">
            <p><strong>Number:</strong> {blockData.block.number}</p>
            <p><strong>Hash:</strong> <span className="mono">{blockData.block.hash}</span></p>
            <p><strong>Parent Hash:</strong> <span className="mono">{blockData.block.parentHash}</span></p>
            <p><strong>Timestamp:</strong> {blockData.block.timestamp}</p>
            <p><strong>Tx Count:</strong> {blockData.block.txCount}</p>
            <p><strong>Transfer Count:</strong> {blockData.transferCount}</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
