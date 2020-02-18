import React, { useState } from 'react';
import messages from './messages';
import { FormattedMessage } from 'react-intl';
import { SearchNav, UsersTable } from '../components/userList';

export const UsersList = () => {
  const [filters, setFilters] = useState({ level: 'ALL', role: 'ALL', username: '', page: 1 });

  return (
    <div>
      <h3 className="barlow-condensed f2 ma0 pv3 dib v-mid ttu pl2 pl0-l">
        <FormattedMessage {...messages.userList} />
      </h3>
      <div className="w-80 bg-white cf pa3 mb4">
        <SearchNav filters={filters} setFilters={setFilters} />
        <UsersTable filters={filters} setFilters={setFilters} />
      </div>
    </div>
  );
};
