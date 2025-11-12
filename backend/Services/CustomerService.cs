using backend.DTO;
using backend.Models;
using backend.Repository;

namespace backend.Services
{
    public class CustomerService
    {
        private readonly CustomerRepository _repo;

        public CustomerService(CustomerRepository repo)
        {
            _repo = repo;
        }

        // Phân trang
        public async Task<(List<CustomerDTO> Items, int TotalPages)> GetPaginatedAsync(int page, int pageSize)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var totalItems = await _repo.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            var customers = await _repo.GetPaginatedAsync(page, pageSize);

            var dtos = customers.Select(c => new CustomerDTO
            {
                Id = c.Id,
                FullName = c.FullName,
                Phone = c.Phone,
                Email = c.Email,
                Address = c.Address
            }).ToList();

            return (dtos, totalPages);
        }

        // Tìm kiếm theo tên
        public async Task<List<CustomerDTO>> SearchByNameAsync(string keyword)
        {
            var customers = await _repo.SearchByNameAsync(keyword);
            return customers.Select(c => new CustomerDTO
            {
                Id = c.Id,
                FullName = c.FullName,
                Phone = c.Phone,
                Email = c.Email,
                Address = c.Address
            }).ToList();
        }
    }
}
